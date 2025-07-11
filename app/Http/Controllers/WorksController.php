<?php
namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WorksController extends Controller
{
    public function index(Request $request)
    {
        $query = Project::query();

        if ($search = $request->input('search')) {
            $query->where('title', 'like', "%{$search}%");
        }

        $works = $query->orderBy('id', 'desc')->paginate(10);

        return Inertia::render('Works/Index', [
            'works' => $works,
            'filters' => $request->only('search'),
        ]);
    }
}
