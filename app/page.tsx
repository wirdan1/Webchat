import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center px-4">
          <h1 className="text-2xl font-bold">ChatGroup</h1>
          <div className="ml-auto flex gap-2">
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Register</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="container grid items-center gap-6 py-20 md:py-32">
          <div className="flex flex-col items-center gap-4 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Connect with your group</h2>
            <p className="max-w-[700px] text-muted-foreground md:text-xl">
              A modern group chat application with multimedia support. Share messages, images, videos, and audio with
              your friends.
            </p>
            <div className="flex gap-4">
              <Link href="/register">
                <Button size="lg">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" size="lg">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
          <div className="mx-auto mt-16 max-w-5xl rounded-lg border bg-background p-8 shadow-lg">
            <div className="aspect-video overflow-hidden rounded-lg bg-muted">
              <img
                src="/placeholder.svg?height=720&width=1280"
                alt="Chat application preview"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} ChatGroup. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
