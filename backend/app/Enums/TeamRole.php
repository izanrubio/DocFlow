<?php

namespace App\Enums;

enum TeamRole: string
{
    case Admin  = 'admin';
    case Editor = 'editor';
    case Viewer = 'viewer';

    public function label(): string
    {
        return match($this) {
            self::Admin  => 'Administrador',
            self::Editor => 'Editor',
            self::Viewer => 'Visor',
        };
    }

    public function canEdit(): bool
    {
        return $this !== self::Viewer;
    }

    public function isAdmin(): bool
    {
        return $this === self::Admin;
    }
}
