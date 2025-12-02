CREATE TABLE users (
    id UUID NOT NULL,
    email VARCHAR NOT NULL,
    password_hash VARCHAR NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    PRIMARY KEY (id),
    UNIQUE (email)
);

CREATE TABLE sessions (
    id UUID NOT NULL,
    user_id UUID NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_seconds INTEGER NOT NULL,
    final_transcript TEXT NOT NULL,
    word_count INTEGER NOT NULL,
    language VARCHAR(10),
    model_used VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    PRIMARY KEY (id),
    FOREIGN KEY(user_id) REFERENCES users (id)
);
