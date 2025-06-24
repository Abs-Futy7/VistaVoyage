import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Edit3, UserCircle } from 'lucide-react'
import { userMockProfile } from '@/utils/contants'
import { Input } from '@/components/ui/input'


function ProfilePage() {
  return (
    <Card className="shadow-sm shadow-blue-500/50 border-1 border-blue-400 rounded-lg max-w-3xl mx-auto">
      <CardHeader className="border-b border-blue-400">
        <div className="flex items-center space-x-4">
            <UserCircle className="h-10 w-10 text-blue-500" />
            <div>
                <CardTitle className="text-2xl font-headline text-gray-800">My Profile</CardTitle>
                <CardDescription>View and manage your personal information.</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-8">
        <div className="flex flex-col sm:flex-row items-center space-y-6 sm:space-y-0 sm:space-x-8 justify-center">
            <Avatar className="h-32 w-32 border-4 border-blue-500 shadow-md">
                <AvatarImage src={userMockProfile.avatarUrl} alt={userMockProfile.name} data-ai-hint="person profile"/>
                <AvatarFallback className="text-4xl">{userMockProfile.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className="flex-grow text-center sm:text-left">
                <h2 className="text-3xl font-headline font-semibold text-foreground">{userMockProfile.name}</h2>
                <p className="text-muted-foreground">{userMockProfile.email}</p>
                <p className="text-muted-foreground">{userMockProfile.phone || "No phone number provided"}</p>
                <button  className="mt-4 flex items-center text-primary hover:text-primary/80 transition-colors cursor-pointer bg-blue-200 px-3 py-2 rounded-lg border border-blue-300 hover:bg-blue-300/50">
                    <Edit3 className="mr-2 h-4 w-4 " /> Change Profile Picture
                </button>
            </div>
        </div>
        
        <form className="space-y-6">
            <div>
                <label htmlFor="name" className="text-base">Full Name</label>
                <Input id="name" defaultValue={userMockProfile.name} className="mt-1 h-11 text-base bg-gray-100 border border-gray-800/20"/>
            </div>
            <div>
                <label htmlFor="email" className="text-base">Email Address</label>
                <Input id="email" type="email" defaultValue={userMockProfile.email} className="mt-1 h-11 text-base bg-gray-100 border border-gray-800/20"/>
            </div>
            <div>
                <label htmlFor="phone" className="text-base">Phone Number</label>
                <Input id="phone" type="tel" defaultValue={userMockProfile.phone} className="mt-1 h-11 text-base bg-gray-100 border border-gray-800/20"/>
            </div>
             
            <div className="flex justify-end pt-4">
                <button type="submit" className="bg-green-200 px-4 py-2 rounded-lg text-green-800 border border-green-600 hover:bg-green-300/50 cursor-pointer">Save Changes</button>
            </div>
        </form>

      </CardContent>
    </Card>
  )
}

export default ProfilePage
