<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'message' => 'Lexora API',
        'version' => '1.0.0',
        'status' => 'running'
    ]);
});

// Help center routes
use App\Http\Controllers\HelpController;
use App\Http\Controllers\Admin\HelpController as AdminHelpController;

Route::middleware(['auth'])->group(function () {
    Route::get('help', [HelpController::class, 'index'])->name('help.index');
    Route::post('help', [HelpController::class, 'store'])->name('help.store');
    Route::get('help/{helpTicket}', [HelpController::class, 'show'])->name('help.show');
    Route::post('help/{helpTicket}/reply', [HelpController::class, 'reply'])->name('help.reply');
});

Route::prefix('admin')->name('admin.')->middleware(['auth','role:admin'])->group(function(){
    Route::get('help', [AdminHelpController::class, 'index'])->name('help.index');
    Route::get('help/{helpTicket}', [AdminHelpController::class, 'show'])->name('help.show');
    Route::post('help/{helpTicket}/reply', [AdminHelpController::class, 'reply'])->name('help.reply');
    Route::post('help/{helpTicket}/resolve', [AdminHelpController::class, 'resolve'])->name('help.resolve');
});
