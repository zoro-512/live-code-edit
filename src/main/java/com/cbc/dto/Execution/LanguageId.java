package com.cbc.dto.Execution;

public enum LanguageId {

    CPP(54),
    JAVA(62),
    JAVASCRIPT(63),
    PYTHON(71);


    private final int id;

    LanguageId(int id) {
        this.id = id;
    }

    public int getId() {
        return id;
    }
}