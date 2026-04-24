<?php

namespace App\Services;

use App\Exceptions\PlanLimitExceededException;
use App\Models\Document;
use App\Models\Template;
use App\Models\Tenant;

class PlanService
{
    public function getLimits(Tenant $tenant): array
    {
        return config('plans.' . $tenant->plan->value . '.limits', config('plans.free.limits'));
    }

    public function canCreateDocument(Tenant $tenant): bool
    {
        $limit = $this->getLimits($tenant)['documents_per_month'];
        if ($limit === -1) return true;
        return $this->getCurrentUsage($tenant)['documents_this_month'] < $limit;
    }

    public function canAddSigner(Tenant $tenant, Document $document): bool
    {
        $limit = $this->getLimits($tenant)['signers_per_document'];
        if ($limit === -1) return true;
        return $document->signers()->count() < $limit;
    }

    public function canCreateTemplate(Tenant $tenant): bool
    {
        $limit = $this->getLimits($tenant)['templates'];
        if ($limit === -1) return true;
        return $this->getCurrentUsage($tenant)['templates_count'] < $limit;
    }

    public function getCurrentUsage(Tenant $tenant): array
    {
        return [
            'documents_this_month' => Document::where('tenant_id', $tenant->id)
                ->whereYear('created_at', now()->year)
                ->whereMonth('created_at', now()->month)
                ->count(),
            'templates_count' => Template::where('tenant_id', $tenant->id)->count(),
        ];
    }

    public function getUsagePercentages(Tenant $tenant): array
    {
        $usage  = $this->getCurrentUsage($tenant);
        $limits = $this->getLimits($tenant);

        $pct = fn ($used, $limit) => $limit === -1 || $limit === 0
            ? 0
            : min(100, (int) round($used / $limit * 100));

        return [
            'documents' => $pct($usage['documents_this_month'], $limits['documents_per_month']),
            'templates' => $pct($usage['templates_count'], $limits['templates']),
        ];
    }

    public function assertCanCreateDocument(Tenant $tenant): void
    {
        if (!$this->canCreateDocument($tenant)) {
            $limit = $this->getLimits($tenant)['documents_per_month'];
            throw new PlanLimitExceededException(
                "Has alcanzado el límite de {$limit} documentos este mes. Mejora tu plan para continuar."
            );
        }
    }

    public function assertCanAddSigner(Tenant $tenant, Document $document): void
    {
        if (!$this->canAddSigner($tenant, $document)) {
            $limit = $this->getLimits($tenant)['signers_per_document'];
            throw new PlanLimitExceededException(
                "Este documento ha alcanzado el límite de {$limit} firmantes de tu plan."
            );
        }
    }

    public function assertCanCreateTemplate(Tenant $tenant): void
    {
        if (!$this->canCreateTemplate($tenant)) {
            $limit = $this->getLimits($tenant)['templates'];
            throw new PlanLimitExceededException(
                "Has alcanzado el límite de {$limit} plantillas de tu plan. Mejora tu plan para continuar."
            );
        }
    }
}
