import { useAuth } from "@/lib/auth-context";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Calendar, Shield } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-heading font-bold text-3xl mb-2" data-testid="settings-title">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>

        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Your personal account details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-lg">{user?.full_name}</h3>
                <p className="text-muted-foreground text-sm">{user?.email}</p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={user?.full_name || ""}
                  disabled
                  data-testid="settings-fullname-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ""}
                  disabled
                  data-testid="settings-email-input"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Details */}
        <Card>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
            <CardDescription>
              Your account information and subscription status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Current Plan</p>
                    <p className="text-sm text-muted-foreground">Your subscription tier</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-primary border-primary">
                  {user?.plan?.toUpperCase() || "FREE"}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Tenant ID</p>
                    <p className="text-sm text-muted-foreground">Your unique organization identifier</p>
                  </div>
                </div>
                <code className="text-sm font-mono text-muted-foreground">
                  {user?.tenant_id || "N/A"}
                </code>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Member Since</p>
                    <p className="text-sm text-muted-foreground">Account creation date</p>
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plan Features */}
        <Card>
          <CardHeader>
            <CardTitle>Plan Features</CardTitle>
            <CardDescription>
              What's included in your current plan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg border border-border">
                <h4 className="font-medium mb-2">Free Tier</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Up to 3 projects</li>
                  <li>• 100 documents per project</li>
                  <li>• 1,000 conversations/month</li>
                  <li>• Basic analytics</li>
                  <li>• Community support</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg border border-primary/50 bg-primary/5">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  Pro Tier
                  <Badge variant="secondary">Coming Soon</Badge>
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Unlimited projects</li>
                  <li>• Unlimited documents</li>
                  <li>• Unlimited conversations</li>
                  <li>• Advanced analytics</li>
                  <li>• Priority support</li>
                  <li>• Custom branding</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
