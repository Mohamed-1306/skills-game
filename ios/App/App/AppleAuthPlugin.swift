import Foundation
import Capacitor
import AuthenticationServices
import CryptoKit

@objc(AppleAuthPlugin)
public class AppleAuthPlugin: CAPPlugin,
                              ASAuthorizationControllerDelegate,
                              ASAuthorizationControllerPresentationContextProviding {

    private var currentCall: CAPPluginCall?
    private var currentNonce: String?
    private var authorizationController: ASAuthorizationController?

    // MARK: - JS entry point
    @objc func signInWithApple(_ call: CAPPluginCall) {
        NSLog("🔥 AppleAuthPlugin signInWithApple")
        self.currentCall = call

        guard #available(iOS 13.0, *) else {
            call.reject("iOS 13+ required")
            return
        }

        let nonce = randomNonceString()
        currentNonce = nonce

        let provider = ASAuthorizationAppleIDProvider()
        let request = provider.createRequest()
        request.requestedScopes = [.fullName, .email]
        request.nonce = sha256(nonce)

        let controller = ASAuthorizationController(authorizationRequests: [request])
        self.authorizationController = controller
        controller.delegate = self
        controller.presentationContextProvider = self

        DispatchQueue.main.async {
            controller.performRequests()
        }
    }

    // MARK: - Apple callbacks
    public func authorizationController(
        controller: ASAuthorizationController,
        didCompleteWithAuthorization authorization: ASAuthorization
    ) {
        guard
            let credential = authorization.credential as? ASAuthorizationAppleIDCredential,
            let tokenData = credential.identityToken,
            let identityToken = String(data: tokenData, encoding: .utf8),
            let nonce = currentNonce
        else {
            currentCall?.reject("Invalid Apple credential")
            return
        }

        currentCall?.resolve([
            "identityToken": identityToken,
            "nonce": nonce
        ])
    }

    public func authorizationController(
        controller: ASAuthorizationController,
        didCompleteWithError error: Error
    ) {
        currentCall?.reject(error.localizedDescription)
    }

    // MARK: - Presentation anchor (CRITICAL)
    public func presentationAnchor(for controller: ASAuthorizationController) -> ASPresentationAnchor {
        return bridge?.viewController?.view.window ?? ASPresentationAnchor()
    }

    // MARK: - Utils
    private func randomNonceString(length: Int = 32) -> String {
        let charset = Array("0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._")
        var result = ""
        var remaining = length

        while remaining > 0 {
            let random = UInt8.random(in: 0...255)
            if random < charset.count {
                result.append(charset[Int(random)])
                remaining -= 1
            }
        }
        return result
    }

    private func sha256(_ input: String) -> String {
        let data = Data(input.utf8)
        let hash = SHA256.hash(data: data)
        return hash.map { String(format: "%02x", $0) }.joined()
    }
}

