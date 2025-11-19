import Foundation
import Combine
final class ActivityService: ObservableObject {
    @Published var activities: [Activity] = []
    
    static let shared = ActivityService()
    private init() {}
    
    func fetchActivities(limit: Int = 50) async throws {
        let resp: ActivitiesResponse = try await APIClient.shared.request("/api/activities?limit=\(limit)", requiresAuth: true)
        DispatchQueue.main.async { self.activities = resp.activities }
    }
}

