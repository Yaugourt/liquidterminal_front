# Changelog

What changed for the people who use Liquid Terminal, in plain words, newest first.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). There are no version numbers: `main` is deployed to production, so a section is the date a change reached `main`.

How to use it: every pull request whose change is visible to a user adds one line under `[Unreleased]`, in the right group (Added, Changed, Fixed, Removed, Security). While there, it moves the lines of pull requests already merged under the date of their merge.

## [Unreleased]

## 2026-11-11

### Added

- Elysium analytics pages show the time their figures date from.

### Changed

- The Elysium launchpads page loads its list 200 rows at a time instead of all at once.

### Fixed

- The Elysium fees page counts every fee, and shows the two shares that were missing.

## 2026-11-10

### Added

- Elysium mainnet is public and is now the default network.
- The Elysium data pages follow the network switch (mainnet or testnet).
- The Elysium builder tools work on mainnet.
- The Elysium overview shows the live mainnet head and its latest blocks.

### Changed

- The Elysium launchpads page only asks for the rows it shows, so it opens faster.

## 2026-11-05

### Changed

- On the dashboard, the amount left on a running TWAP goes down continuously, to the cent, instead of by steps.

### Fixed

- A running TWAP keeps moving until its next fill instead of stopping just before it.
- The reserve yield figure answers right after a new deployment instead of failing on the first visits.

## 2026-11-03

### Fixed

- The progress of a TWAP shown as an estimate moves with the clock too.
