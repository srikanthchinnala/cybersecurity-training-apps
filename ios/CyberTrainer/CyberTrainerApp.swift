import SwiftUI

@main
struct CyberTrainerApp: App {
    @StateObject private var progress = ProgressStore()

    var body: some Scene {
        WindowGroup {
            HomeView()
                .environmentObject(progress)
                .preferredColorScheme(.dark)
        }
    }
}
