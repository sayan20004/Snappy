import Foundation
import Combine
final class FocusService: ObservableObject {
    @Published var currentSession: FocusSession?
    
    static let shared = FocusService()
    private init() {}
    
    func startFocus(todoId: String, duration: Int = 25) async throws {
        let payload = ["todoId": todoId, "duration": duration] as [String : Any]
        let data = try JSONSerialization.data(withJSONObject: payload)
        let resp: FocusResponse = try await APIClient.shared.request("/api/focus/start", method: "POST", body: data, requiresAuth: true)
        DispatchQueue.main.async { self.currentSession = resp.session }
    }
    
    func completeFocus(sessionId: String) async throws {
        let resp: FocusResponse = try await APIClient.shared.request("/api/focus/\(sessionId)/complete", method: "POST", requiresAuth: true)
        DispatchQueue.main.async { self.currentSession = resp.session }
    }
    
    func cancelFocus(sessionId: String) async throws {
        let resp: FocusResponse = try await APIClient.shared.request("/api/focus/\(sessionId)/cancel", method: "POST", requiresAuth: true)
        DispatchQueue.main.async { self.currentSession = nil }
    }
}
