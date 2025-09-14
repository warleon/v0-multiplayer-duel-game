import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SignupSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="w-full max-w-md">
        <Card className="border-purple-500/20 bg-slate-800/50 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-white">Welcome to the Arena!</CardTitle>
            <CardDescription className="text-purple-200">Check your email to activate your warrior</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-purple-600 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="text-purple-100">
                We've sent you a confirmation email. Click the link in your email to activate your warrior profile and
                start dueling!
              </p>
              <p className="text-purple-300 text-sm">You'll start with 1,000 coins to begin your journey.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
