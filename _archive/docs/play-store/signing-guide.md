# Android App Signing & Release Build Guide

## 1. Generovanie Keystore (Podpisový kľúč)
Pre vydanie aplikácie na Google Play potrebujete vygenerovať "Upload Key". Tento kľúč sa používa na podpísanie vašej aplikácie pred nahraním do Play Console.

**Spustite v termináli:**
```bash
keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```
*(Keytool je súčasťou inštalácie Java/Android SDK)*

**Budete vyzvaní zadať:**
- Heslo pre keystore (zapamätajte si ho!)
- Meno a priezvisko, organizáciu, mesto, krajinu (SK).

**Výstup:** Súbor `my-release-key.keystore`. Tento súbor **NIKDY NESTRAŤTE** a **NIKDY NEZVEREJŇUJTE**.

## 2. Príprava `build.gradle`
Presuňte vygenerovaný `my-release-key.keystore` do priečinka `android/app/`.

Upravte `android/app/build.gradle` (v sekcii `android`):

```gradle
android {
    ...
    signingConfigs {
        release {
            storeFile file("my-release-key.keystore")
            storePassword "VASE_HESLO"
            keyAlias "my-key-alias"
            keyPassword "VASE_HESLO"
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```
*(Poznámka: Pre vyššiu bezpečnosť nedávajte heslá priamo do súboru, ale použite `gradle.properties`)*

## 3. Build AAB (Android App Bundle)
V termináli v koreňovom priečinku projektu:

```bash
cd android
./gradlew bundleRelease
```

Výsledný súbor nájdete v:
`android/app/build/outputs/bundle/release/app-release.aab`

👉 **Tento súbor `app-release.aab` nahráte do Google Play Console.**

## 4. Testovanie na zariadení (APK)
Ak chcete len testovať na svojom telefóne:

```bash
cd android
./gradlew assembleDebug
```
Výsledný súbor: `android/app/build/outputs/apk/debug/app-debug.apk`

---
**Tip:** Ak nemáte nainštalované Android Studio, najjednoduchšie je otvoriť priečinok `android/` v Android Studio a nechať ho stiahnuť všetky SDK dependencies.
