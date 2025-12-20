import Foundation

// MARK: - User
struct User: Codable, Identifiable {
    var id: String
    var name: String
    var email: String
    var avatarUrl: String?
    var createdAt: Date?
}

struct AuthResponse: Codable {
    var token: String
    var user: User?
}

// MARK: - Todo
struct SubStep: Codable, Identifiable {
    var id: String
    var text: String
    var completed: Bool
}

// FIX: Renamed from Link to TaskLink to avoid conflict with SwiftUI.Link
struct TaskLink: Codable, Identifiable {
    var id: String
    var url: String
    var title: String?
}

struct Comment: Codable, Identifiable {
    var id: String
    var userId: String
    var userName: String?
    var text: String
    var createdAt: Date
    var reactions: [Reaction]?
}

struct Reaction: Codable, Identifiable {
    var id: String
    var userId: String
    var type: String // like, love, check, zap
}

struct Todo: Codable, Identifiable {
    var id: String
    var title: String
    var note: String?
    var status: String? // todo, in-progress, done, archived, snoozed
    var priority: Int? // 0-3
    var dueAt: Date?
    var tags: [String]?
    var listId: String?
    var owner: String?
    
    // Advanced fields
    var subSteps: [SubStep]?
    var links: [TaskLink]? // FIX: Updated type
    var voiceNote: String?
    var energyLevel: String? // low, medium, high
    var effortMinutes: Int?
    var location: String?
    var mood: String?
    var bestTimeToComplete: String?
    var assignedTo: [String]?
    var source: String? // manual, voice, email, etc
    var comments: [Comment]?
    
    var createdAt: Date?
    var updatedAt: Date?
}

struct TodoResponse: Codable {
    var todo: Todo
}

struct TodoListResponse: Codable {
    var todos: [Todo]
    var pagination: Pagination?
}

struct Pagination: Codable {
    var total: Int
    var limit: Int
    var skip: Int
    var hasMore: Bool
}

// MARK: - List
struct TodoList: Codable, Identifiable {
    var id: String
    var name: String
    var description: String?
    var color: String?
    var icon: String?
    var isShared: Bool?
    var owner: String
    var collaborators: [Collaborator]?
    var createdAt: Date?
    var updatedAt: Date?
}

struct Collaborator: Codable, Identifiable {
    var id: String
    var userId: String
    var userName: String?
    var email: String?
    var role: String // owner, editor, viewer
    var joinedAt: Date?
}

struct ListResponse: Codable {
    var list: TodoList
}

struct ListsResponse: Codable {
    var lists: [TodoList]
}

// MARK: - Template
struct Template: Codable, Identifiable {
    var id: String
    var name: String
    var description: String?
    var category: String?
    var todos: [TemplateTodo]
    var isPublic: Bool?
    var createdBy: String?
    var createdAt: Date?
}

struct TemplateTodo: Codable, Identifiable {
    var id: String
    var title: String
    var note: String?
    var priority: Int?
    var tags: [String]?
}

struct TemplateResponse: Codable {
    var template: Template
}

struct TemplatesResponse: Codable {
    var templates: [Template]
}

// MARK: - Activity
struct Activity: Codable, Identifiable {
    var id: String
    var actor: String
    var actorName: String?
    var action: String // create_todo, update_todo, delete_todo, etc
    var targetType: String // todo, list, template
    var targetId: String
    var payload: [String: String]?
    var createdAt: Date
}

struct ActivitiesResponse: Codable {
    var activities: [Activity]
}

// MARK: - Focus Session
struct FocusSession: Codable, Identifiable {
    var id: String
    var todoId: String
    var duration: Int // minutes
    var startedAt: Date
    var completedAt: Date?
    var status: String // active, completed, cancelled
}

struct FocusResponse: Codable {
    var session: FocusSession
}

// MARK: - Export/Import
struct ExportData: Codable {
    var todos: [Todo]
    var lists: [TodoList]
    var exportedAt: Date
}
