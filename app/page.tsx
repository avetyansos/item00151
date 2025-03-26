import PomodoroTimer from "@/components/pomodoro-timer"
import { ThemeProvider } from "@/components/theme-provider"

export default function Home() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-gray-100">Pomodoro Timer</h1>
        <PomodoroTimer />
      </main>
    </ThemeProvider>
  )
}

