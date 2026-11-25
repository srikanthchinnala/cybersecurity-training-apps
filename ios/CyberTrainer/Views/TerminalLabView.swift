import SwiftUI

/// Simulated terminal lab. No real commands run: input is matched against each task's pattern.
struct TerminalLabView: View {
    let module: TrainingModule
    @EnvironmentObject private var progress: ProgressStore

    struct Line: Identifiable {
        enum Kind { case system, command, output, success, error }
        let id = UUID()
        let kind: Kind
        let text: String
    }

    @State private var lines: [Line] = []
    @State private var input = ""
    @State private var step = 0
    @FocusState private var focused: Bool

    var body: some View {
        VStack(spacing: 0) {
            ScrollViewReader { proxy in
                ScrollView {
                    LazyVStack(alignment: .leading, spacing: 4) {
                        ForEach(lines) { line in
                            Text(line.kind == .command ? "$ " + line.text : line.text)
                                .foregroundStyle(color(line.kind))
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .id(line.id)
                        }
                    }
                    .font(.system(.footnote, design: .monospaced))
                    .padding()
                }
                .onChange(of: lines.count) {
                    if let last = lines.last { withAnimation { proxy.scrollTo(last.id, anchor: .bottom) } }
                }
            }

            HStack {
                Text("$").foregroundStyle(.cyan)
                TextField("type a command", text: $input)
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()
                    .focused($focused)
                    .onSubmit(run)
                Button("Hint") { print(.system, "Hint: " + (step < module.lab.count ? module.lab[step].hint : "Lab complete")) }
                    .font(.caption)
            }
            .font(.system(.body, design: .monospaced))
            .padding()
            .background(Color.black.opacity(0.6))
        }
        .background(Color.black)
        .onAppear(perform: start)
    }

    private func start() {
        guard lines.isEmpty else { return }
        step = module.lab.indices.first { !progress.isDone(module.key("lab", $0)) } ?? module.lab.count
        print(.system, module.labIntro)
        print(.system, "Task \(min(step + 1, module.lab.count)) of \(module.lab.count). Tap Hint if you get stuck.")
        focused = true
    }

    private func run() {
        let command = input.trimmingCharacters(in: .whitespaces)
        input = ""
        guard !command.isEmpty else { return }
        print(.command, command)

        if command == "clear" { lines.removeAll(); return }
        guard step < module.lab.count else { print(.success, "Lab complete. Try another module!"); return }

        let task = module.lab[step]
        if task.matches(command) {
            task.output.forEach { print(.output, $0) }
            progress.award(module.key("lab", step), xp: XP.labTask)
            print(.success, "✔ Task \(step + 1)/\(module.lab.count) complete (+\(XP.labTask) XP)")
            step += 1
            if step == module.lab.count { print(.success, "🎉 Lab complete! Badge earned.") }
        } else {
            print(.error, "That didn't reveal anything useful. Tap Hint.")
        }
        focused = true
    }

    private func print(_ kind: Line.Kind, _ text: String) {
        lines.append(Line(kind: kind, text: text))
    }

    private func color(_ kind: Line.Kind) -> Color {
        switch kind {
        case .system: return .gray
        case .command: return .white
        case .output: return Color(white: 0.85)
        case .success: return .green
        case .error: return .red
        }
    }
}
