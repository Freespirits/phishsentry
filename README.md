# PhishSentry
AI-powered phishing URL detector for browsers, APIs, and batch pipelines.

[![CI](https://img.shields.io/github/actions/workflow/status/phishsentry/phishsentry/ci.yml?label=CI)](https://github.com/phishsentry/phishsentry/actions)
[![Release](https://img.shields.io/github/v/release/phishsentry/phishsentry)](https://github.com/phishsentry/phishsentry/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#license)
[![Issues](https://img.shields.io/github/issues/phishsentry/phishsentry)](https://github.com/phishsentry/phishsentry/issues)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](#contributing)

> **TL;DR:** Real-time phishing risk scoring for links in emails, chats, and websites—built for researchers, SOCs, and power users.

---

## Table of Contents
- [Features](#features)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [CLI](#cli)
- [API](#api)
- [Examples](#examples)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [Security](#security)
- [License](#license)

---

## Features
- ✅ URL risk scoring (lexical + DNS + WHOIS + ML signals)
- 🚀 Streaming analysis API with JSON output
- 🔌 Pluggable enrichers (VT/URLScan/AbuseIPDB/etc.)
- 🧩 Works as a library, service, or CLI
- 🛡️ Privacy-first: no URL content stored by default

## Architecture
- **Core**: service exposes REST `/api/v1/analyze` and a CLI
- **Pipelines**: `producer → enrichers → model → scorer → reporter`
- **Extensibility**: add enrichers via a simple interface

