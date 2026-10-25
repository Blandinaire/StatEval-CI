<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;
use Laravel\Sanctum\Sanctum;

class MobileDataControllerTest extends TestCase
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
                'Professeur',
                'Educateur',
            ] as $roleName
        ) {
            Role::findOrCreate($roleName, 'web');
        }
    }

    public function test_classes_endpoint_rejects_unauthenticated_requests(): void
    {
        $response = $this->getJson('/api/mobile/classes');

        $response->assertUnauthorized();
    }

    public function test_eleves_endpoint_rejects_unauthenticated_requests(): void
    {
        $response = $this->getJson('/api/mobile/eleves');

        $response->assertUnauthorized();
    }

    public function test_eleves_endpoint_rejects_invalid_page_number(): void
    {
        $user = User::factory()->create([
            'etablissement_id' => null,
        ]);

        $user->assignRole('SuperAdmin');

        Sanctum::actingAs($user, ['*']);

        $response = $this->getJson('/api/mobile/eleves?page=0');

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['page']);
    }

    public function test_eleves_endpoint_rejects_non_integer_class_id(): void
    {
        $user = User::factory()->create([
            'etablissement_id' => null,
        ]);

        $user->assignRole('SuperAdmin');

        Sanctum::actingAs($user, ['*']);

        $response = $this->getJson('/api/mobile/eleves?classe_id=abc');

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['classe_id']);
    }
}
