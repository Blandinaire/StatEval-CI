<?php

namespace Tests\Feature\Api;

use App\Models\User;
use App\Models\Etablissement;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;
use Tests\TestCase;
use Laravel\Sanctum\Sanctum;

class MobileAbsenceRetardControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        app(\Spatie\Permission\PermissionRegistrar::class)
            ->forgetCachedPermissions();

        foreach (
            [
                'SuperAdmin',
                'Administrateur',
                'Direction',
                'Educateur',
                'Parent',
                'Professeur',
            ] as $roleName
        ) {
            Role::findOrCreate($roleName, 'web');
        }
    }

    public function test_absences_endpoint_rejects_unauthenticated_requests(): void
    {
        $response = $this->getJson('/api/mobile/absences');

        $response->assertUnauthorized();
    }

    public function test_retards_endpoint_rejects_unauthenticated_requests(): void
    {
        $response = $this->getJson('/api/mobile/retards');

        $response->assertUnauthorized();
    }

    public function test_absence_creation_rejects_unauthenticated_requests(): void
    {
        $response = $this->postJson('/api/mobile/absences', []);

        $response->assertUnauthorized();
    }

    public function test_retard_creation_rejects_unauthenticated_requests(): void
    {
        $response = $this->postJson('/api/mobile/retards', []);

        $response->assertUnauthorized();
    }

    public function test_professeur_cannot_access_absences_endpoint(): void
    {
        $user = User::factory()->create([
            'etablissement_id' => null,
        ]);

        $user->assignRole('Professeur');

        Sanctum::actingAs($user, ['*']);

        $response = $this->getJson('/api/mobile/absences');

        $response->assertForbidden();
    }

    public function test_professeur_cannot_create_absence(): void
    {
        $user = User::factory()->create([
            'etablissement_id' => null,
        ]);

        $user->assignRole('Professeur');

        Sanctum::actingAs($user, ['*']);

        $response = $this->postJson('/api/mobile/absences', []);

        $response->assertForbidden();
    }

    public function test_educateur_can_access_absences_endpoint(): void
    {
        $this->creerEducateurAuthentifie();

        $response = $this->getJson('/api/mobile/absences');

        $response->assertOk();
    }

    public function test_educateur_can_access_retards_endpoint(): void
    {
        $this->creerEducateurAuthentifie();

        $response = $this->getJson('/api/mobile/retards');

        $response->assertOk();
    }

    private function creerEducateurAuthentifie(): User
    {
        $etablissement = Etablissement::create([
            'nom' => 'Établissement de test',
            'ville' => 'Bingerville',
        ]);

        $educateurId = DB::table('educateurs')->insertGetId([
            'etablissement_id' => $etablissement->id,
            'nom' => 'KOUAME',
            'prenoms' => 'Jean',
            'sexe' => 'Masculin',
            'matricule' => 'TEST-EDU-' . uniqid(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $user = User::factory()->create([
            'etablissement_id' => $etablissement->id,
            'educateur_id' => $educateurId,
        ]);

        $user->assignRole('Educateur');

        Sanctum::actingAs($user, ['*']);

        return $user;
    }
}
