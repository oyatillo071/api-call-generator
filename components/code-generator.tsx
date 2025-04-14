"use client";

import { useState } from "react";
import { useTranslation } from "@/hooks/use-translation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Copy, Check } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Checkbox } from "@/components/ui/checkbox";
import CodeDisplay from "./code-display";
import { generateCode } from "@/lib/code-generator";

type AuthMethod = "none" | "bearer" | "basic" | "apiKey" | "custom";

export default function CodeGenerator() {
  const { t } = useTranslation();
  const { toast } = useToast();

  const [url, setUrl] = useState("");
  const [method, setMethod] = useState("GET");
  const [technology, setTechnology] = useState("fetch");
  const [authMethod, setAuthMethod] = useState<AuthMethod>("none");
  const [token, setToken] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [apiKeyName, setApiKeyName] = useState("X-API-Key");
  const [apiKeyValue, setApiKeyValue] = useState("");
  const [customHeaderName, setCustomHeaderName] = useState("");
  const [customHeaderValue, setCustomHeaderValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [useVariables, setUseVariables] = useState(false);
  const [activeTab, setActiveTab] = useState("fetch");

  const generateCodeForTechnology = (tech: string) => {
    return generateCode({
      url,
      method,
      technology: tech,
      authMethod,
      token,
      username,
      password,
      apiKeyName,
      apiKeyValue,
      customHeaderName,
      customHeaderValue,
      useVariables,
    });
  };

  const generatedCode = generateCodeForTechnology(activeTab);

  const handleGenerate = () => {
    if (!url) {
      toast({
        title: t("error"),
        description: t("urlRequired"),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      toast({
        title: t("success"),
        description: t("codeCopied"),
      });

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      toast({
        title: t("error"),
        description: t("copyFailed"),
        variant: "destructive",
      });
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t("generateApiCall")}</CardTitle>
        <CardDescription>{t("generateApiCallDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          <div className="grid gap-3">
            <Label htmlFor="url">{t("apiUrl")}</Label>
            <Input
              id="url"
              placeholder="https://api.example.com/data"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="grid gap-3">
              <Label htmlFor="method">{t("requestMethod")}</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger id="method">
                  <SelectValue placeholder={t("selectMethod")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                  <SelectItem value="PATCH">PATCH</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-3">
              <Label htmlFor="technology">{t("technology")}</Label>
              <Select value={technology} onValueChange={setTechnology}>
                <SelectTrigger id="technology">
                  <SelectValue placeholder={t("selectTechnology")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fetch">Fetch API</SelectItem>
                  <SelectItem value="axios">Axios</SelectItem>
                  <SelectItem value="xhr">XMLHttpRequest</SelectItem>
                  <SelectItem value="jquery">jQuery</SelectItem>
                  <SelectItem value="reactQuery">React Query</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-3">
            <Label htmlFor="auth">{t("authorization")}</Label>
            <Select
              value={authMethod}
              onValueChange={(value) => setAuthMethod(value as AuthMethod)}
            >
              <SelectTrigger id="auth">
                <SelectValue placeholder={t("selectAuth")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t("none")}</SelectItem>
                <SelectItem value="bearer">{t("bearerToken")}</SelectItem>
                <SelectItem value="basic">{t("basicAuth")}</SelectItem>
                <SelectItem value="apiKey">{t("apiKey")}</SelectItem>
                <SelectItem value="custom">{t("customHeader")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {authMethod === "bearer" && (
            <div className="grid gap-3">
              <Label htmlFor="token">{t("bearerToken")}</Label>
              <Input
                id="token"
                placeholder={t("enterToken")}
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
            </div>
          )}

          {authMethod === "basic" && (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
              <div className="grid gap-3">
                <Label htmlFor="username">{t("username")}</Label>
                <Input
                  id="username"
                  placeholder={t("enterUsername")}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="password">{t("password")}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={t("enterPassword")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          )}

          {authMethod === "apiKey" && (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
              <div className="grid gap-3">
                <Label htmlFor="apiKeyName">{t("apiKeyName")}</Label>
                <Input
                  id="apiKeyName"
                  placeholder="X-API-Key"
                  value={apiKeyName}
                  onChange={(e) => setApiKeyName(e.target.value)}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="apiKeyValue">{t("apiKeyValue")}</Label>
                <Input
                  id="apiKeyValue"
                  placeholder={t("enterApiKey")}
                  value={apiKeyValue}
                  onChange={(e) => setApiKeyValue(e.target.value)}
                />
              </div>
            </div>
          )}

          {authMethod === "custom" && (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
              <div className="grid gap-3">
                <Label htmlFor="customHeaderName">{t("headerName")}</Label>
                <Input
                  id="customHeaderName"
                  placeholder="X-Custom-Header"
                  value={customHeaderName}
                  onChange={(e) => setCustomHeaderName(e.target.value)}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="customHeaderValue">{t("headerValue")}</Label>
                <Input
                  id="customHeaderValue"
                  placeholder={t("enterHeaderValue")}
                  value={customHeaderValue}
                  onChange={(e) => setCustomHeaderValue(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Checkbox
              id="useVariables"
              checked={useVariables}
              onCheckedChange={(checked) => setUseVariables(!!checked)}
            />
            <Label htmlFor="useVariables" className="cursor-pointer">
              {t("useVariables")}
            </Label>
          </div>

          <Button onClick={handleGenerate} disabled={loading || !url}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("generating")}
              </>
            ) : (
              t("generate")
            )}
          </Button>

          {generatedCode && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium">{t("generatedCode")}</h3>
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  {copied ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      {t("copied")}
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      {t("copy")}
                    </>
                  )}
                </Button>
              </div>

              <Tabs
                defaultValue="fetch"
                value={activeTab}
                onValueChange={handleTabChange}
              >
                <TabsList className="mb-2">
                  <TabsTrigger value="fetch">Fetch API</TabsTrigger>
                  <TabsTrigger value="axios">Axios</TabsTrigger>
                  <TabsTrigger value="xhr">XMLHttpRequest</TabsTrigger>
                  <TabsTrigger value="jquery">jQuery</TabsTrigger>
                  <TabsTrigger value="reactQuery">React Query</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab}>
                  <CodeDisplay code={generatedCode} language="javascript" />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </CardContent>
      <Toaster />
    </Card>
  );
}
