
import React from "react";
import { TwilioClient } from "./TwilioClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const QuickCall = () => {
  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Quick Call</CardTitle>
        </CardHeader>
        <CardContent>
          <TwilioClient />
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickCall;
