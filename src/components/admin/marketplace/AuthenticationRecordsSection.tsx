import React from "react";
import { UseFormRegister, UseFormWatch } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MarketplaceFormData } from "@/features/marketplace/schema";
import { inputClassName, checkboxClassName } from "./shared";

interface AuthenticationRecordsSectionProps {
  register: UseFormRegister<MarketplaceFormData>;
  watch: UseFormWatch<MarketplaceFormData>;
}

export function AuthenticationRecordsSection({
  register,
  watch,
}: AuthenticationRecordsSectionProps) {
  const authenticated = watch("authenticated");

  return (
    <Card className="bg-surface/40 border-border/60 backdrop-blur-md transition-all duration-300 hover:border-border/80">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-white tracking-tight">
          Authentication Records
        </CardTitle>
        <CardDescription className="text-textSec text-sm">
          Certificate of Authenticity (COA) details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center space-x-2.5 py-1">
          <input
            type="checkbox"
            id="authenticated"
            {...register("authenticated")}
            className={checkboxClassName}
          />
          <Label
            htmlFor="authenticated"
            className="cursor-pointer text-sm font-medium text-white select-none"
          >
            Item is authenticated
          </Label>
        </div>

        {authenticated && (
          <div className="space-y-4 pt-2 border-t border-border/40 animate-in fade-in duration-300">
            <div className="space-y-2">
              <Label htmlFor="certificate" className="text-sm font-semibold text-white">
                Certificate Number / Reference
              </Label>
              <Input
                id="certificate"
                {...register("certificate")}
                placeholder="Certificate number or details"
                className={inputClassName}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="coa_issuer" className="text-sm font-semibold text-white">
                COA Issuer
              </Label>
              <Input
                id="coa_issuer"
                {...register("coa_issuer")}
                placeholder="e.g., PSA/DNA, Beckett, JSA"
                className={inputClassName}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="authenticated_date" className="text-sm font-semibold text-white">
                Authenticated Date
              </Label>
              <Input
                id="authenticated_date"
                type="date"
                {...register("authenticated_date")}
                className={inputClassName}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
