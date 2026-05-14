import { api } from "@/lib/api";
import { getBackOfficeAccessState } from "@/features/auth/auth-access";
import { useTranslation } from "@dropit/i18n";
import { GLOBAL_ROLE, ORGANIZATION_ROLE } from "@dropit/schemas";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Outlet,
  createFileRoute,
  redirect,
  useMatches,
} from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AthleteInvitationForm } from "../../features/athletes/athlete-invitation-form";
import { columns } from "@/features/athletes/columns";
import { DataTable } from "@/components/ui/data-table";
import { DialogCreation } from "@/features/athletes/dialog-creation";
import { usePageMeta } from "@/hooks/use-page-meta";
import { Button } from "@/components/ui/button";
import { HeroCard } from "@/components/ui/hero-card";
import { Input } from "@/components/ui/input";
import { Search, Users } from "lucide-react";

export const Route = createFileRoute("/_home/athletes")({
  beforeLoad: async () => {
    const accessState = await getBackOfficeAccessState();

    if (accessState.organizationRole !== ORGANIZATION_ROLE.ADMIN) {
      throw redirect({
        to:
          accessState.userRole === GLOBAL_ROLE.ADMIN ? "/admin" : "/dashboard",
      });
    }
  },
  component: AthletesPage,
});

function AthletesPage() {
  const { t } = useTranslation(["common", "athletes"]);
  const { setPageMeta } = usePageMeta();
  const [createAthleteModalOpen, setCreateAthleteModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();
  const navigate = Route.useNavigate();
  const matches = useMatches();
  const isAthleteDetail = matches.some(
    (match) => match.routeId === "/_home/athletes/$athleteId",
  );

  useEffect(() => {
    setPageMeta({ title: t("athletes:title") });
  }, [setPageMeta, t]);

  const { data: athletes, isLoading: athletesLoading } = useQuery({
    queryKey: ["athletes"],
    queryFn: async () => {
      const response = await api.athlete.getAthletes();
      if (response.status !== 200) throw new Error("Failed to load athletes");
      return response.body;
    },
  });

  const handleCreationSuccess = () => {
    setCreateAthleteModalOpen(false);
    queryClient.invalidateQueries({ queryKey: ["athletes"] });
  };

  const filteredAthletes = (athletes ?? []).filter((athlete) => {
    const fullName = `${athlete.firstName} ${athlete.lastName}`.toLowerCase();
    return fullName.includes(search.toLowerCase());
  });

  // Si on est sur un détail d'athlète, on affiche directement le contenu
  if (isAthleteDetail) {
    return <Outlet />;
  }

  return (
    <div className="flex flex-col h-full p-4">
      {/* Fixed header section */}
      <div className="flex-none">
        <HeroCard
          variant="athlete"
          title={t("athletes:hero.title")}
          description={t("athletes:hero.description")}
          stat={{
            label: t("athletes:hero.stat_label"),
            value: athletes?.length || 0,
            icon: Users,
            description: t("athletes:hero.stat_description"),
            callToAction: {
              text: t("athletes:hero.stat_cta"),
              onClick: () => {
                console.log("Open athletes tutorial video");
              },
            },
          }}
        />
      </div>

      {/* DataTable with internal scroll management */}
      <div className="flex-1 min-h-0">
        {athletesLoading ? (
          <div className="flex items-center justify-center h-32">
            {t("common:loading")}
          </div>
        ) : !athletes?.length ? (
          <div className="flex flex-col items-center justify-center h-32 gap-2 text-muted-foreground">
            <p>{t("common:no_results")}</p>
            <p className="text-sm">{t("common:start_create")}</p>
            <Button onClick={() => setCreateAthleteModalOpen(true)}>
              {t("athletes:filters.create_athlete")}
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between pb-4">
              <div className="relative w-full max-w-lg">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("athletes:filters.search_placeholder")}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="bg-background pl-8"
                />
              </div>
              <Button onClick={() => setCreateAthleteModalOpen(true)}>
                {t("athletes:filters.create_athlete")}
              </Button>
            </div>

            <DataTable
              columns={columns}
              data={filteredAthletes}
              pagination={
                filteredAthletes.length > 10
                  ? { initialPageSize: 10 }
                  : undefined
              }
              onRowClick={(athleteId) =>
                navigate({ to: `/athletes/${athleteId}` })
              }
            />
          </>
        )}
      </div>

      <DialogCreation
        open={createAthleteModalOpen}
        onOpenChange={setCreateAthleteModalOpen}
        title={t("athletes:invitation.title")}
        description={t("athletes:invitation.description")}
      >
        <AthleteInvitationForm
          onSuccess={handleCreationSuccess}
          onCancel={() => setCreateAthleteModalOpen(false)}
        />
      </DialogCreation>
    </div>
  );
}
