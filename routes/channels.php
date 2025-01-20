<?php

use App\Models\Message;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Log;

// Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
//     return (int) $user->id === (int) $id;
// });

// Broadcast::channel('chat.{id}', function ($user, $id) {
//     return (int) $user->id === (int) $id; // Hanya pengguna dengan ID yang sesuai dapat mengakses channel
// });

// Broadcast::channel('chat.{id}', function ($user, $id) {
//     return (int) $user->id === (int) $id || (int) $user->friends->contains('id', $id);
// });

Broadcast::channel('chat.{id}', function ($user, $id) {
    if ((int) $user->id === (int) $id) {
        return true;
    }

    return Message::where('id', $id)
        ->where(function ($query) use ($user) {
            $query->where('sender_id', $user->id)
                ->orWhere('receiver_id', $user->id);
        })
        ->exists();
});
