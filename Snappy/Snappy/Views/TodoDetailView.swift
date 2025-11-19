import SwiftUI
import Combine
struct TodoDetailView: View {
    var todo: Todo
    @State private var editingNote: String = ""
    @State private var isSaving = false
    @State private var showingComments = false
    @State private var showingFocus = false

    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Title")) {
                    Text(todo.title).font(.headline)
                }
                
                Section(header: Text("Note")) {
                    TextEditor(text: $editingNote)
                        .frame(minHeight: 120)
                }

                // STATUS + PRIORITY
                Section(header: Text("Status & Priority")) {
                    Picker("Status", selection: Binding(
                        get: { todo.status ?? "todo" },
                        set: { updateField("status", value: $0) }
                    )) {
                        Text("📋 To Do").tag("todo")
                        Text("🔄 In Progress").tag("in-progress")
                        Text("✅ Done").tag("done")
                        Text("📦 Archived").tag("archived")
                        Text("💤 Snoozed").tag("snoozed")
                    }

                    Picker("Priority", selection: Binding(
                        get: { todo.priority ?? 2 },
                        set: { updateField("priority", value: $0) }
                    )) {
                        Text("🔴 Urgent").tag(0)
                        Text("🟠 High").tag(1)
                        Text("🔵 Normal").tag(2)
                        Text("⚪️ Low").tag(3)
                    }
                }

                // SUBSTEPS
                if let subSteps = todo.subSteps, !subSteps.isEmpty {
                    Section(header: Text("Sub-steps")) {
                        ForEach(subSteps) { step in
                            HStack {
                                Image(systemName: step.completed ? "checkmark.circle.fill" : "circle")
                                    .foregroundColor(step.completed ? .green : .gray)
                                Text(step.text)
                            }
                        }
                    }
                }

                // LINKS
                if let links = todo.links, !links.isEmpty {
                    Section(header: Text("Links")) {
                        ForEach(links) { link in
                            Link(link.title ?? link.url, destination: URL(string: link.url)!)
                        }
                    }
                }

                // DETAILS
                Section(header: Text("Details")) {
                    if let energyLevel = todo.energyLevel {
                        LabeledContent("Energy", value: energyLevel.capitalized)
                    }
                    if let effortMinutes = todo.effortMinutes {
                        LabeledContent("Effort", value: "\(effortMinutes) min")
                    }
                    if let location = todo.location {
                        LabeledContent("Location", value: location)
                    }
                }

                // ACTIONS
                Section(header: Text("Actions")) {
                    Button(action: { showingFocus = true }) {
                        Label("Start Focus Session", systemImage: "timer")
                    }

                    Button(action: { showingComments = true }) {
                        Label("Comments (\(todo.comments?.count ?? 0))",
                              systemImage: "bubble.left.and.bubble.right")
                    }

                    Button("Save Changes", action: saveChanges)
                        .disabled(isSaving)
                }
            }
            .navigationTitle("Task Details")
            .onAppear { editingNote = todo.note ?? "" }
            .sheet(isPresented: $showingComments) {
                CommentsView(todo: $todo)
            }
            .sheet(isPresented: $showingFocus) {
                FocusSessionView(todoId: todo.id)
            }
        }
    }

    func updateField(_ field: String, value: Any) {
        Task {
            do {
                try await TodoService.shared.updateTodo(id: todo.id, updates: [field: value])

                if let updated = TodoService.shared.todos.first(where: { $0.id == todo.id }) {
                    DispatchQueue.main.async { todo = updated }
                }
            } catch {
                print("Update error:", error)
            }
        }
    }

    func saveChanges() {
        Task {
            isSaving = true
            do {
                try await TodoService.shared.updateTodo(id: todo.id, updates: ["note": editingNote])
            } catch {
                print("Save error:", error)
            }
            isSaving = false
        }
    }
}

// COMMENTS VIEW ---------------------------------------------------------

struct CommentsView: View {
    @Binding var todo: Todo
    @State private var newComment = ""
    @Environment(\.dismiss) var dismiss

    var body: some View {
        NavigationView {
            VStack {
                List {
                    ForEach(todo.comments ?? []) { comment in
                        VStack(alignment: .leading, spacing: 8) {
                            HStack {
                                Text(comment.userName ?? "User")
                                    .font(.subheadline.bold())
                                Spacer()
                                Text(comment.createdAt, style: .relative)
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }

                            Text(comment.text).font(.body)

                            HStack {
                                ForEach(["like", "love", "check", "zap"], id: \.self) { type in
                                    Button {
                                        addReaction(commentId: comment.id, type: type)
                                    } label: {
                                        Text(reactionEmoji(type))
                                        if let count = comment.reactions?
                                            .filter({ $0.type == type }).count,
                                           count > 0 {
                                            Text("\(count)").font(.caption)
                                        }
                                    }
                                }
                            }
                            .font(.caption)
                        }
                        .padding(.vertical, 4)
                    }
                }

                HStack {
                    TextField("Add a comment...", text: $newComment)
                        .textFieldStyle(.roundedBorder)

                    Button("Send") {
                        Task {
                            do {
                                try await TodoService.shared.addComment(
                                    todoId: todo.id,
                                    text: newComment
                                )
                                newComment = ""
                                if let updated = TodoService.shared.todos.first(where: { $0.id == todo.id }) {
                                    DispatchQueue.main.async { todo = updated }
                                }
                            } catch {
                                print("Comment error:", error)
                            }
                        }
                    }
                    .disabled(newComment.isEmpty)
                }
                .padding()
            }
            .navigationTitle("Comments")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Done") { dismiss() }
                }
            }
        }
    }

    func addReaction(commentId: String, type: String) {
        Task {
            do {
                try await TodoService.shared.addReaction(
                    todoId: todo.id,
                    commentId: commentId,
                    type: type
                )

                if let updated = TodoService.shared.todos.first(where: { $0.id == todo.id }) {
                    DispatchQueue.main.async { todo = updated }
                }
            } catch {
                print("Reaction error:", error)
            }
        }
    }

    func reactionEmoji(_ type: String) -> String {
        switch type {
        case "like": return "👍"
        case "love": return "❤️"
        case "check": return "✅"
        case "zap": return "⚡️"
        default: return "👍"
        }
    }
}

// FOCUS SESSION VIEW -----------------------------------------------------

struct FocusSessionView: View {
    let todoId: String
    @StateObject private var focusService = FocusService.shared
    @State private var duration = 25
    @State private var timeRemaining = 0
    @State private var timer: Timer?
    @Environment(\.dismiss) var dismiss

    var body: some View {
        NavigationView {
            VStack(spacing: 30) {
                Text("\(timeRemaining / 60):\(String(format: "%02d", timeRemaining % 60))")
                    .font(.system(size: 60, weight: .bold, design: .rounded))

                if focusService.currentSession == nil {
                    Stepper("Duration: \(duration) min", value: $duration, in: 5...60, step: 5)
                        .padding()

                    Button("Start Focus") {
                        Task {
                            do {
                                try await focusService.startFocus(todoId: todoId, duration: duration)
                                timeRemaining = duration * 60
                                startTimer()
                            } catch {
                                print("Focus error:", error)
                            }
                        }
                    }
                    .buttonStyle(.borderedProminent)
                    .controlSize(.large)

                } else {
                    HStack(spacing: 20) {
                        Button("Complete") {
                            Task {
                                if let sessionId = focusService.currentSession?.id {
                                    try? await focusService.completeFocus(sessionId: sessionId)
                                }
                                timer?.invalidate()
                                dismiss()
                            }
                        }
                        .buttonStyle(.borderedProminent)
                        .tint(.green)

                        Button("Cancel") {
                            Task {
                                if let sessionId = focusService.currentSession?.id {
                                    try? await focusService.cancelFocus(sessionId: sessionId)
                                }
                                timer?.invalidate()
                                dismiss()
                            }
                        }
                        .buttonStyle(.bordered)
                        .tint(.red)
                    }
                }

                Spacer()
            }
            .padding()
            .navigationTitle("Focus Session")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Close") {
                        timer?.invalidate()
                        dismiss()
                    }
                }
            }
        }
    }

    func startTimer() {
        timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { _ in
            if timeRemaining > 0 {
                timeRemaining -= 1
            } else {
                timer?.invalidate()
            }
        }
    }
}
