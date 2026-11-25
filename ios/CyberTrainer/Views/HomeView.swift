import SwiftUI

struct HomeView: View {
    @EnvironmentObject private var progress: ProgressStore
    @State private var confirmReset = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    XPHeader()

                    Text("Modules")
                        .font(.title3.bold())
                        .padding(.top, 8)

                    ForEach(TrainingModule.all) { module in
                        NavigationLink(value: module) {
                            ModuleCard(module: module, completion: progress.completion(of: module))
                        }
                        .buttonStyle(.plain)
                    }

                    Button("Reset progress", role: .destructive) { confirmReset = true }
                        .font(.footnote)
                        .padding(.top, 8)
                }
                .padding()
            }
            .navigationTitle("CyberTrainer")
            .navigationDestination(for: TrainingModule.self) { ModuleDetailView(module: $0) }
            .confirmationDialog("Reset all progress?", isPresented: $confirmReset, titleVisibility: .visible) {
                Button("Reset", role: .destructive) { progress.reset() }
            }
        }
        .tint(.cyan)
    }
}

struct XPHeader: View {
    @EnvironmentObject private var progress: ProgressStore

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Label("Level \(progress.level)", systemImage: "shield.lefthalf.filled")
                    .font(.headline)
                Spacer()
                Text("\(progress.xp) XP")
                    .font(.headline.monospacedDigit())
                    .foregroundStyle(.cyan)
            }
            Text(progress.rank)
                .font(.subheadline)
                .foregroundStyle(.secondary)
            ProgressView(value: progress.progressToNext)
                .tint(.cyan)
        }
        .padding()
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 16))
    }
}

struct ModuleCard: View {
    let module: TrainingModule
    let completion: Double

    var body: some View {
        HStack(spacing: 14) {
            Image(systemName: module.symbol)
                .font(.title2)
                .foregroundStyle(.cyan)
                .frame(width: 44, height: 44)
                .background(.cyan.opacity(0.12), in: RoundedRectangle(cornerRadius: 12))
            VStack(alignment: .leading, spacing: 4) {
                Text(module.title).font(.headline)
                Text("\(module.level) · \(module.lessons.count) lessons · \(module.lab.count)-step lab")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                ProgressView(value: completion).tint(.cyan)
            }
            Image(systemName: completion >= 1 ? "checkmark.seal.fill" : "chevron.right")
                .foregroundStyle(completion >= 1 ? .green : .secondary)
        }
        .padding()
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 16))
    }
}
