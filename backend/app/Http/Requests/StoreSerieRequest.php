<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreSerieRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
{
    return [
        'cycle_id' => ['required', 'exists:cycles,id'],
        'code' => ['required', 'string', 'max:20'],
        'libelle' => ['required', 'string', 'max:255'],
        'ordre' => ['required', 'integer', 'min:1'],
        'actif' => ['boolean'],
    ];
}
}
