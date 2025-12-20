import SwiftUI

struct ActivityTimelineView: View {
    @StateObject private var activityService = ActivityService.shared
    @State private var loading = false
    
    var body: some View {
        NavigationView {
            List(activityService.activities) { activity in
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        Image(systemName: actionIcon(activity.action))
                            .foregroundColor(actionColor(activity.action))
                            .frame(width: 30)
                        
                        VStack(alignment: .leading, spacing: 4) {
                            Text(activityDescription(activity))
                                .font(.body)
                            
                            Text(activity.createdAt, style: .relative)
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                }
                .padding(.vertical, 4)
            }
            .navigationTitle("Activity")
            .task {
                loading = true
                do {
                    try await activityService.fetchActivities()
                } catch {
                    print("Failed to load activities: \(error)")
                }
                loading = false
            }
            .overlay {
                if loading {
                    ProgressView()
                }
            }
        }
    }
    
    func actionIcon(_ action: String) -> String {
        switch action {
        case "create_todo": return "plus.circle.fill"
        case "update_todo": return "pencil.circle.fill"
        case "delete_todo": return "trash.circle.fill"
        case "create_list": return "folder.fill.badge.plus"
        case "invite_collaborator": return "person.badge.plus"
        case "complete_todo": return "checkmark.circle.fill" // FIX: Added missing case
        default: return "circle.fill"
        }
    }
    
    func actionColor(_ action: String) -> Color {
        switch action {
        case "create_todo", "create_list": return .green
        case "update_todo": return .blue
        case "delete_todo": return .red
        case "invite_collaborator": return .purple
        case "complete_todo": return .green // FIX: Added missing case
        default: return .gray
        }
    }
    
    func activityDescription(_ activity: Activity) -> String {
        let actor = activity.actorName ?? "Someone"
        
        switch activity.action {
        case "create_todo":
            return "\(actor) created task: \(activity.payload?["title"] ?? "Untitled")"
        case "update_todo":
            return "\(actor) updated a task"
        case "delete_todo":
            return "\(actor) deleted a task"
        case "create_list":
            return "\(actor) created list: \(activity.payload?["name"] ?? "Untitled")"
        case "invite_collaborator":
            return "\(actor) invited \(activity.payload?["email"] ?? "someone") to collaborate"
        case "complete_todo": // FIX: Added missing case
            return "\(actor) completed task: \(activity.payload?["title"] ?? "Untitled")"
        default:
            return "\(actor) performed \(activity.action)"
        }
    }
}
