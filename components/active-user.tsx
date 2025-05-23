import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"

interface ActiveUsersListProps {
  currentUser: any
  activeUsers: any[]
}

export function ActiveUsersList({ currentUser, activeUsers }: ActiveUsersListProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const formatLastActive = (date: string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Users</CardTitle>
        <CardDescription>Users who are currently online or were recently active</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Current user */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar>
                {currentUser.avatarUrl ? (
                  <AvatarImage src={currentUser.avatarUrl || "/placeholder.svg"} alt={currentUser.name} />
                ) : null}
                <AvatarFallback>{getInitials(currentUser.name)}</AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white"></div>
            </div>
            <div>
              <div className="font-medium">{currentUser.name} (You)</div>
              <div className="text-xs text-muted-foreground">Online now</div>
            </div>
          </div>

          {/* Other active users */}
          {activeUsers.length > 0 ? (
            activeUsers.map((user) => (
              <div key={user._id.toString()} className="flex items-center gap-4">
                <div className="relative">
                  <Avatar>
                    {user.avatarUrl ? <AvatarImage src={user.avatarUrl || "/placeholder.svg"} alt={user.name} /> : null}
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white"></div>
                </div>
                <div>
                  <div className="font-medium">{user.name}</div>
                  <div className="text-xs text-muted-foreground">Active {formatLastActive(user.lastActive)}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <p>No other users are currently active</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
