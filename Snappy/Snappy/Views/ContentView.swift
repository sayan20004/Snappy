import Combine
import SwiftUI

struct ContentView: View {
    @StateObject private var auth = AuthService.shared

    var body: some View {
        Group {
            if auth.currentUser == nil {
                LoginView()
            } else {
                MainTabView()
            }
        }
        .onAppear {
            Task {
                do {
                    try await auth.fetchMe()
                } catch {
                    // ignore for now
                }
            }
        }
    }
}

struct MainTabView: View {
    var body: some View {
        TabView {
            NavigationView {
                ListsAndTodosView()
            }
            .tabItem { Label("Tasks", systemImage: "checklist") }
            
            TemplatesView()
                .tabItem { Label("Templates", systemImage: "doc.on.doc") }
            
            ActivityTimelineView()
                .tabItem { Label("Activity", systemImage: "clock.arrow.circlepath") }
            
            ProfileView()
                .tabItem { Label("Profile", systemImage: "person.crop.circle") }
        }
    }
}
