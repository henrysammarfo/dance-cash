import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { login, signup } from "@/app/actions/auth"
import Link from "next/link"

export default function LoginPage({ searchParams }: { searchParams: { message: string } }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-border/50 bg-card/50 backdrop-blur">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Studio Access</CardTitle>
          <CardDescription className="text-center">Enter your email to sign in or create an account</CardDescription>
        </CardHeader>
        <form>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="studio@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            {searchParams.message && <div className="text-sm text-red-500 text-center">{searchParams.message}</div>}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button formAction={login} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              Sign In
            </Button>
            <Button
              formAction={signup}
              variant="outline"
              className="w-full border-primary/50 text-primary hover:bg-primary/10 bg-transparent"
            >
              Create Account
            </Button>
            <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
              Back to Home
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
