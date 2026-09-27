/**
 * Pulls `@types/multer` into the global scope so `Express.Multer.File` resolves.
 *
 * `tsc` auto-includes every `@types/*` package, but oxlint's type checker does not,
 * so the reference is declared explicitly here.
 */
/// <reference types="multer" />
