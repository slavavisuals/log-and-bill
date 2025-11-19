import { useUser } from "@clerk/clerk-react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useEffect } from "react"
import { orpc } from "@/orpc/client"

export function useEnsureUser() {
	const { user, isLoaded, isSignedIn } = useUser()

	const { mutate: createUser, isPending } = useMutation({
		mutationFn: orpc.getOrCreateUser.call,
	})

	useEffect(() => {
		if (isLoaded && isSignedIn && user) {
			createUser({
				clerkId: user.id,
				email: user.primaryEmailAddress?.emailAddress || "",
				name: user.fullName || user.firstName || "User",
			})
		}
	}, [isLoaded, isSignedIn, user, createUser])

	return {
		isLoading: !isLoaded || isPending,
		isReady: isLoaded && isSignedIn && !isPending,
	}
}
