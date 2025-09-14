import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="text-center space-y-8 max-w-4xl mx-auto">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-white mb-4 text-balance">Battle Arena</h1>
          <p className="text-xl text-purple-200 text-balance max-w-2xl mx-auto">
            Enter the ultimate multiplayer dueling arena. Challenge warriors, bet your coins, and prove your worth in
            turn-based combat.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-3">
            <Link href="/auth/signup">Join the Arena</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-purple-500 text-purple-300 hover:bg-purple-500/10 px-8 py-3 bg-transparent"
          >
            <Link href="/auth/login">Enter as Warrior</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 rounded-lg p-6">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Challenge Warriors</h3>
            <p className="text-purple-200 text-sm">Browse the duel board and challenge other players to epic battles</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 rounded-lg p-6">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Bet & Win Coins</h3>
            <p className="text-purple-200 text-sm">
              Wager your coins and win 80% of your opponent's bet when victorious
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 rounded-lg p-6">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Turn-Based Combat</h3>
            <p className="text-purple-200 text-sm">Engage in strategic Pokemon-style battles with tactical gameplay</p>
          </div>
        </div>
      </div>
    </div>
  )
}
