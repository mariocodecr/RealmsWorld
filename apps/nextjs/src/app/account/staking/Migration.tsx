import { useState } from "react";
import { Realm } from "@/.graphclient";
import { RealmsTable } from "@/app/_components/RealmsTable";
import { columns } from "@/app/_components/RealmsTableColumns";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@realms-world/ui";

export const StakingMigration = () => {
  const { address } = useAccount();
  const [selectedRealms, setSelectedRealms] = useState<readonly string[]>([]);
  const onSelectRealms = (realms: readonly string[]) => {
    setSelectedRealms(realms);
  };
  const { data: realmsData, isLoading: realmsDataIsLoading } = useQuery({
    queryKey: ["UsersRealms" + address],
    queryFn: async () =>
      await fetch(`/api/subgraph/getRealms?address=${address}`, {
        method: "POST",
      })
        .then((res) => res.json())
        .then((res) => {
          return res.data;
        }),
    enabled: !!address,
    //refetchInterval: 10000,
  });

  const steps = [
    {
      id: "1",
      title: "1. Unstake Realms from Galleon",
      content: (
        <RealmsTable
          data={realmsData?.bridgedRealms as Realm[]}
          columns={columns}
        />
      ),
    },
    { id: "2", title: "2. Approve Realms Transfer" },
    { id: "3", title: "3. Deposit Realms for vRealms" },
    { id: "4", title: "4. Delegate voting power (optional)" },
  ];
  return (
    <div className="w-full">
      <Accordion type="multiple">
        {steps.map((step) => (
          <AccordionItem className="mb-2" key={step.id} value={step.id}>
            <AccordionTrigger className="border p-4">
              {step.title}
            </AccordionTrigger>
            <AccordionContent>{step.content}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};
