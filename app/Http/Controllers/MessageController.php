<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class MessageController extends Controller
{
    public function chat(User $friend)
    {
        return Inertia::render('Chat', [
            "friend" => $friend,
            'currentUser' => Auth::user()
        ]);
    }

    // Menampilkan pesan yang dikirim dan yang diterima
    public function getMessage(User $friend)
    {
        return Message::query()
            ->where(function ($query) use ($friend) {
                $query->where('sender_id', Auth::user()->id)
                    ->where('receiver_id', $friend->id);
            })
            ->orWhere(function ($query) use ($friend) {
                $query->where('sender_id', $friend->id)
                    ->where('receiver_id', Auth::user()->id);
            })
            ->with(['sender', 'receiver'])
            ->orderBy('id', 'asc')
            ->get();
    }

    // Mengirim data dari yang ngetik
    public function sendMessage(Request $request, User $friend)
    {
        $message = Message::create([
            'sender_id' => Auth::user()->id,
            'receiver_id' => $friend->id,
            'text' => $request->message
        ]);

        broadcast(new MessageSent($message));

        return $message;
    }
}
