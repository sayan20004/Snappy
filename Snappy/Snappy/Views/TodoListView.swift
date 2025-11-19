import SwiftUI

struct TodoListView: View {
    var listId: String? = nil
    
    @StateObject private var todoService = TodoService.shared
    @State private var newTitle = ""
    @State private var loading = false
    @State private var showingAddTodo = false

    var body: some View {
        VStack {
            HStack {
                TextField("Quick add task", text: $newTitle)
                    .textFieldStyle(.roundedBorder)
                Button("Add") {
                    Task {
                        guard !newTitle.isEmpty else { return }
                        do {
                            try await todoService.createTodo(title: newTitle, listId: listId)
                            newTitle = ""
                        } catch {
                            print("Create error: \(error)")
                        }
                    }
                }
                .buttonStyle(.borderedProminent)
                
                Button(action: { showingAddTodo = true }) {
                    Image(systemName: "ellipsis.circle")
                }
            }.padding()

            if loading {
                ProgressView()
            }

            List(filteredTodos) { todo in
                NavigationLink(destination: TodoDetailView(todo: todo)) {
                    TodoRow(todo: todo)
                }
            }
            .listStyle(.plain)
        }
        .navigationTitle(listId == nil ? "All Tasks" : "Tasks")
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Menu {
                    Button(action: { exportData() }) {
                        Label("Export", systemImage: "square.and.arrow.up")
                    }
                } label: {
                    Image(systemName: "ellipsis.circle")
                }
            }
        }
        .task {
            loading = true
            do {
                try await todoService.fetchTodos(listId: listId)
            } catch {
                print("Fetch todos error: \(error)")
            }
            loading = false
        }
        .sheet(isPresented: $showingAddTodo) {
            AddTodoView(listId: listId)
        }
    }
    
    var filteredTodos: [Todo] {
        if let listId = listId {
            return todoService.todos.filter { $0.listId == listId }
        }
        return todoService.todos
    }
    
    func exportData() {
        Task {
            do {
                let data = try await ExportService.shared.exportJSON()
                let url = try ExportService.shared.saveToFile(data: data, filename: "snappy-export.json")
                // Show share sheet
                let activityVC = UIActivityViewController(activityItems: [url], applicationActivities: nil)
                if let scene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
                   let window = scene.windows.first,
                   let rootVC = window.rootViewController {
                    rootVC.present(activityVC, animated: true)
                }
            } catch {
                print("Export failed: \(error)")
            }
        }
    }
}

struct TodoRow: View {
    let todo: Todo
    
    var body: some View {
        HStack {
            Image(systemName: statusIcon)
                .foregroundColor(statusColor)
            
            VStack(alignment: .leading, spacing: 4) {
                Text(todo.title).font(.headline)
                
                if let note = todo.note, !note.isEmpty {
                    Text(note)
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .lineLimit(1)
                }
                
                HStack {
                    if let priority = todo.priority {
                        priorityBadge(priority)
                    }
                    if let tags = todo.tags, !tags.isEmpty {
                        ForEach(tags.prefix(2), id: \.self) { tag in
                            Text("#\(tag)")
                                .font(.caption)
                                .foregroundColor(.blue)
                        }
                    }
                    if let energyLevel = todo.energyLevel {
                        Text(energyLevel)
                            .font(.caption)
                            .padding(4)
                            .background(Color.orange.opacity(0.2))
                            .cornerRadius(4)
                    }
                }
            }
            
            Spacer()
            
            if let dueAt = todo.dueAt {
                Text(dueAt, style: .relative)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
    }
    
    var statusIcon: String {
        switch todo.status {
        case "done": return "checkmark.circle.fill"
        case "in-progress": return "arrow.right.circle"
        case "archived": return "archivebox"
        case "snoozed": return "moon.fill"
        default: return "circle"
        }
    }
    
    var statusColor: Color {
        switch todo.status {
        case "done": return .green
        case "in-progress": return .blue
        case "archived": return .gray
        case "snoozed": return .purple
        default: return .gray
        }
    }
    
    func priorityBadge(_ priority: Int) -> some View {
        let color: Color = priority == 0 ? .red : priority == 1 ? .orange : priority == 2 ? .blue : .gray
        let label = priority == 0 ? "!!!" : priority == 1 ? "!!" : priority == 2 ? "!" : ""
        return Text(label)
            .font(.caption.bold())
            .foregroundColor(color)
    }
}

struct AddTodoView: View {
    var listId: String?
    
    @Environment(\.dismiss) var dismiss
    @State private var title = ""
    @State private var note = ""
    @State private var priority = 2
    @State private var energyLevel = "medium"
    @State private var effortMinutes = 30
    @State private var tags: [String] = []
    @State private var newTag = ""
    
    var body: some View {
        NavigationView {
            Form {
                TextField("Title", text: $title)
                
                Section("Details") {
                    TextField("Note", text: $note, axis: .vertical)
                        .lineLimit(3...6)
                }
                
                Section("Priority") {
                    Picker("Priority", selection: $priority) {
                        Text("🔴 Urgent").tag(0)
                        Text("🟠 High").tag(1)
                        Text("🔵 Normal").tag(2)
                        Text("⚪️ Low").tag(3)
                    }
                    .pickerStyle(.segmented)
                }
                
                Section("Energy & Time") {
                    Picker("Energy Level", selection: $energyLevel) {
                        Text("Low").tag("low")
                        Text("Medium").tag("medium")
                        Text("High").tag("high")
                    }
                    .pickerStyle(.segmented)
                    
                    Stepper("Effort: \(effortMinutes) min", value: $effortMinutes, in: 5...120, step: 5)
                }
                
                Section("Tags") {
                    HStack {
                        TextField("Add tag", text: $newTag)
                        Button("Add") {
                            if !newTag.isEmpty {
                                tags.append(newTag)
                                newTag = ""
                            }
                        }
                    }
                    ForEach(tags, id: \.self) { tag in
                        Text("#\(tag)")
                    }
                    .onDelete { tags.remove(atOffsets: $0) }
                }
            }
            .navigationTitle("New Task")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Create") {
                        Task {
                            do {
                                try await TodoService.shared.createTodo(
                                    title: title,
                                    note: note.isEmpty ? nil : note,
                                    listId: listId,
                                    priority: priority,
                                    tags: tags.isEmpty ? nil : tags,
                                    energyLevel: energyLevel,
                                    effortMinutes: effortMinutes
                                )
                                dismiss()
                            } catch {
                                print("Failed to create: \(error)")
                            }
                        }
                    }
                    .disabled(title.isEmpty)
                }
            }
        }
    }
}
