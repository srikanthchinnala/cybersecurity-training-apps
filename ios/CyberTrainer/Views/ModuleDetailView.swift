import SwiftUI

struct ModuleDetailView: View {
    let module: TrainingModule

    enum Section: String, CaseIterable, Identifiable {
        case learn = "Learn", quiz = "Quiz", lab = "Lab"
        var id: String { rawValue }
    }

    @State private var section: Section = .learn

    var body: some View {
        VStack(spacing: 0) {
            Picker("Section", selection: $section) {
                ForEach(Section.allCases) { Text($0.rawValue).tag($0) }
            }
            .pickerStyle(.segmented)
            .padding()

            switch section {
            case .learn: LessonsView(module: module)
            case .quiz: QuizView(module: module)
            case .lab: TerminalLabView(module: module)
            }
        }
        .navigationTitle(module.title)
        .navigationBarTitleDisplayMode(.inline)
    }
}

// MARK: - Lessons

struct LessonsView: View {
    let module: TrainingModule
    @EnvironmentObject private var progress: ProgressStore

    var body: some View {
        List {
            ForEach(Array(module.lessons.enumerated()), id: \.offset) { index, lesson in
                let key = module.key("lesson", index)
                VStack(alignment: .leading, spacing: 8) {
                    Text("\(index + 1). \(lesson.title)").font(.headline)
                    Text(lesson.body).font(.body).foregroundStyle(.secondary)
                    Button(progress.isDone(key) ? "Completed" : "Mark complete (+\(XP.lesson) XP)") {
                        progress.award(key, xp: XP.lesson)
                    }
                    .buttonStyle(.borderedProminent)
                    .disabled(progress.isDone(key))
                }
                .padding(.vertical, 6)
            }
        }
    }
}

// MARK: - Quiz

struct QuizView: View {
    let module: TrainingModule
    @EnvironmentObject private var progress: ProgressStore
    @State private var index = 0
    @State private var picked: Int?
    @State private var score = 0

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            if index >= module.quiz.count {
                Spacer()
                Text("Score: \(score) / \(module.quiz.count)")
                    .font(.largeTitle.bold())
                    .frame(maxWidth: .infinity)
                Button("Retry") { index = 0; picked = nil; score = 0 }
                    .buttonStyle(.borderedProminent)
                    .frame(maxWidth: .infinity)
                Spacer()
            } else {
                let question = module.quiz[index]
                Text("Question \(index + 1) of \(module.quiz.count)")
                    .font(.caption).foregroundStyle(.secondary)
                Text(question.prompt).font(.title3.bold())

                ForEach(question.options.indices, id: \.self) { option in
                    Button {
                        choose(option, for: question)
                    } label: {
                        Text(question.options[option])
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding()
                            .background(color(for: option, question: question), in: RoundedRectangle(cornerRadius: 12))
                    }
                    .buttonStyle(.plain)
                    .disabled(picked != nil)
                }

                if picked != nil {
                    Button("Next") { index += 1; picked = nil }
                        .buttonStyle(.borderedProminent)
                }
                Spacer()
            }
        }
        .padding()
    }

    private func choose(_ option: Int, for question: Question) {
        picked = option
        if option == question.answer {
            score += 1
            progress.award(module.key("quiz", index), xp: XP.quizCorrect)
        }
    }

    private func color(for option: Int, question: Question) -> Color {
        guard let picked else { return Color.secondary.opacity(0.15) }
        if option == question.answer { return .green.opacity(0.3) }
        if option == picked { return .red.opacity(0.3) }
        return Color.secondary.opacity(0.15)
    }
}
