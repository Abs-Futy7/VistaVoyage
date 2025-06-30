"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { adminService } from "@/lib/api/services/admin";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Calendar, MapPin } from "lucide-react";

export default function ActivityDetailPage() {
  const router = useRouter();
  const params = useParams();
  const activityId = params?.id as string;

  const [activity, setActivity] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activityId) return;

    const fetchActivityDetails = async () => {
      try {
        setLoading(true);
        console.log("Fetching activity details for id:", activityId);
        const data = await adminService.getActivityDetails(activityId);
        console.log("API response:", data);
        setActivity(data);
      } catch (error: any) {
        console.error("API error:", error);
        toast.error("Failed to load activity details", {
          description: error.message || "Please try again",
        });
        router.push("admin/activities");
      } finally {
        setLoading(false);
      }
    };

    fetchActivityDetails();
  }, [activityId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading activity details...</p>
        </div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Activity Not Found</h2>
          <p className="text-gray-600 mb-4">
            The activity you're looking for doesn't exist.
          </p>
          <Button onClick={() => router.push("/admin/activities")}>
            Back to Activities
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => router.push("/admin/activities")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Activities
          </Button>
          <div className="flex items-center space-x-2">
            <MapPin className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold">{activity.name}</h1>
            <Badge variant={activity.is_active ? "default" : "secondary"}>
              {activity.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>
        <Button onClick={() => router.push(`/admin/activities/edit/${activity.id}`)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Activity
        </Button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Activity Name</h3>
                  <p className="text-lg font-semibold">{activity.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Type</h3>
                  <p className="text-lg">{activity.type}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Location</h3>
                  <p className="text-lg">{activity.location}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <Badge variant={activity.is_active ? "default" : "secondary"}>
                    {activity.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
              {activity.description && (
                <>
                  <div className="h-[1px] w-full bg-gray-200 my-4" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{activity.description}</p>
                  </div>
                </>
              )}
              {activity.featured_image && (
                <div className="mb-4 w-full relative rounded overflow-hidden bg-gray-100 flex items-center justify-center">
                  <img
                    src={activity.featured_image.startsWith('http') ? activity.featured_image : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${activity.featured_image}`}
                    alt={activity.name}
                    className="object-cover w-full h-full"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Metadata & Actions */}
        <div className="space-y-6">
          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Metadata
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Created At</h3>
                <p className="text-sm text-gray-700">{formatDate(activity.created_at)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
                <p className="text-sm text-gray-700">{formatDate(activity.updated_at)}</p>
              </div>
              <div className="h-[1px] w-full bg-gray-200 my-4" />
              <div>
                <h3 className="text-sm font-medium text-gray-500">Activity ID</h3>
                <p className="text-sm text-gray-700 font-mono break-all">{activity.id}</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push(`/admin/activities/edit/${activity.id}`)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Activity
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push("/admin/activities")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to List
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
