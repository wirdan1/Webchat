import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function TermsPage() {
  return (
    <div className="container max-w-3xl py-10">
      <div className="mb-8">
        <Link href="/">
          <Button variant="ghost" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>

      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-4">Terms of Service & Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: May 23, 2025</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">1. Data Storage and Security</h2>
          <p>
            By using ChatGroup, you consent to the storage of your personal information, messages, and media files in
            our MongoDB database. We take reasonable measures to protect your data, but no method of transmission or
            storage is 100% secure.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">2. User Registration</h2>
          <p>
            To use ChatGroup, you must register with your name and phone number. This information is used to identify
            you within the application and ensure a personalized experience. You are responsible for maintaining the
            confidentiality of your password.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">3. Content Ownership</h2>
          <p>
            You retain ownership of any content you share through ChatGroup, including messages, images, videos, and
            audio files. However, by uploading content, you grant us a non-exclusive, royalty-free license to use,
            store, and display your content for the purpose of providing and improving our services.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">4. Acceptable Use</h2>
          <p>
            You agree not to use ChatGroup to share content that is illegal, harmful, threatening, abusive, harassing,
            defamatory, or otherwise objectionable. We reserve the right to remove any content that violates these
            terms.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">5. Data Retention</h2>
          <p>
            Your data will be retained as long as you maintain an active account. If you wish to delete your account and
            associated data, please contact the administrator.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">6. Changes to Terms</h2>
          <p>
            We may update these terms from time to time. We will notify you of any significant changes by posting the
            new terms on this page.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">7. Contact</h2>
          <p>If you have any questions about these terms, please contact the administrator.</p>
        </div>
      </div>
    </div>
  )
}
