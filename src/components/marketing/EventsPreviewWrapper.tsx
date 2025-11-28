import { createClient } from "@/lib/supabase/server"
import { EventsPreviewSection, Workshop, Discussion } from "./EventsPreview"

/**
 * Server component that fetches upcoming events and recent discussions
 * for the homepage preview section
 */
export async function EventsPreview() {
  const supabase = await createClient()

  // Fetch upcoming public events (next 3)
  const { data: eventsData, error: eventsError } = await supabase
    .from("events")
    .select("id, slug, title, location, event_date, capacity")
    .eq("is_public", true)
    .gte("event_date", new Date().toISOString())
    .order("event_date", { ascending: true })
    .limit(3)

  if (eventsError) {
    console.error("Failed to fetch events:", eventsError.message)
  }

  // Fetch recent discussions with author info and comment count
  // Using a raw query to get comment count
  const { data: postsData, error: postsError } = await supabase
    .from("posts")
    .select(`
      id,
      slug,
      title,
      tags,
      profiles:author_id (
        full_name
      )
    `)
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(3)

  if (postsError) {
    console.error("Failed to fetch posts:", postsError.message)
  }

  // Get comment counts for each post in a single query
  let discussions: Discussion[] = []
  if (postsData && postsData.length > 0) {
    const postIds = postsData.map((post) => post.id)
    // Fetch comment counts grouped by post_id
    const { data: commentCountsData, error: commentCountsError } = await supabase
      .from("comments")
      .select("post_id, count:id", { count: "exact" })
      .in("post_id", postIds)
      .group("post_id")

    if (commentCountsError) {
      console.error("Failed to fetch comment counts:", commentCountsError.message)
    }

    // Build a map from post_id to count
    const commentCountMap: Record<string, number> = {}
    if (commentCountsData) {
      for (const row of commentCountsData) {
        commentCountMap[row.post_id] = row.count
      }
    }

    discussions = postsData.map((post) => {
      const profile = post.profiles as { full_name: string | null } | null
      return {
        id: post.id,
        slug: post.slug,
        title: post.title,
        author_name: profile?.full_name || null,
        comment_count: commentCountMap[post.id] || 0,
        tags: post.tags,
      }
    })
  }

  // Get community stats
  const { count: memberCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })

  const { count: discussionCount } = await supabase
    .from("posts")
    .select("*", { count: "exact", head: true })

  // Transform events data
  const workshops: Workshop[] = (eventsData || []).map((event) => ({
    id: event.id,
    slug: event.slug,
    title: event.title,
    location: event.location,
    event_date: event.event_date,
    capacity: event.capacity,
  }))

  return (
    <EventsPreviewSection
      workshops={workshops}
      discussions={discussions}
      communityStats={{
        totalMembers: memberCount || 0,
        totalDiscussions: discussionCount || 0,
      }}
    />
  )
}
