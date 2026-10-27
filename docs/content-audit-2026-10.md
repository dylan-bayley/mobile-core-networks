# Content accuracy audit, October 2026

Scope: all content under `src/data` (six Learn lessons, 38 component records, the vignettes, the glossary, the reference tables, every Flows explorer step) plus the prose in `src/components` and `src/pages`. Each claim was checked against the documents in `src/data/reference/sources.js`.

## How it was checked

- **Spec text, not memory.** All twelve 3GPP documents in the registry were downloaded from ETSI at the exact versions listed, along with GSMA IR.92 v24.0 and NG.114 v11.0 and the eight RFCs, then converted to text and searched. Findings below quote the clause they rest on.
- **Every citation resolved.** Each `{ src, clause }` used in the data (about 110 distinct 3GPP clauses, 40 RFC clauses and 5 GSMA clauses) was looked up in its document. The heading was compared with what the scene or record uses it for.
- **Prose read line by line** against the spec text for the cited clause, and against the procedure clauses (TS 23.401 §5.3, TS 23.502 §4.2–4.17) for the Flows steps. The Flows steps carry no citations.

## Headline results

| Check | Result |
|---|---|
| Source registry: document versions and URLs | All 14 3GPP/GSMA versions exist and match the registry exactly. |
| 3GPP clause numbers | All exist in the listed version, and every heading matches its use. |
| RFC clause numbers | All exist. One mismatch: RFC 3261 §20.16 is CSeq, but it is cited for Content-Type, which is §20.15. |
| GSMA clauses | IR.92 §2.4.1 (preconditions), IR.92 §3.2.1 and NG.114 §3.2.1 (codecs) are correct, and the codec rules in the SIP lesson match them word for word. |
| Factual errors | 6 high, 10 medium, 12 low (below). The Flows explorer, which has no citations, holds most of them. |

The cited Learn and Components content is in good shape. Lessons with clause-level citations had almost no errors, while the uncited Flows prose had most of them. That is the main reason for the process changes in phase 3.

## Findings

Severity: **High**: a wrong fact a learner would take away. **Medium**: misleading, overstated or a citation defect. **Low**: imprecise wording or a missing qualifier.

### High

| # | Where | What is wrong | Evidence | Fix |
|---|---|---|---|---|
| H1 | `src/data/flows/sa/voice.js:8` | Says 5QI 5 is "non-GBR, priority 1". | TS 23.501 Table 5.7.4-1: 5QI 5 has default priority level **10**. Priority 1 is the 4G value for QCI 5 (TS 23.203 Table 6.1.7), so the 4G step is right. | Change to "priority level 10". Optionally note that 5G rescaled the priority levels (5QI 1 = 20, 5QI 9 = 90). |
| H2 | `src/data/flows/sa/data.js:29`, `src/data/reference/glossary.js:31`, `:119`, `src/data/reference/nodeNaming.js:29` | Calls Gz an OCS interface ("the OCS's Gy/Gz", "Gz … paths to the OCS"). | TS 32.240 §3: "Gz: Offline charging reference point between a PCEF and an OFCS." Only Gy goes to the OCS. | "replacing Gy to the OCS (online) and Gz to the OFCS (offline)". |
| H3 | `src/data/flows/deltas/endc.js:21` | "The UE never talks RRC directly to the gNB." | TS 37.340 §4.2.1 and §3: SRB3 is "a direct SRB between the SN and the UE" in EN-DC, and lets SN RRC PDUs go straight between the UE and the SN. | "In this procedure the SN's configuration travels inside the eNodeB's RRC message. Later, if SRB3 is configured, the en-gNB can exchange some RRC messages with the UE directly." |
| H4 | `src/data/flows/sa/sms.js:10` | Calls the AMF-to-SMSF hand-off "the direct 5G analogue of the MME handing off to the IP-SM-GW". | The MME never hands off to the IP-SM-GW. The S-CSCF reaches it over ISC (TS 23.228; the 4G SMS flow in this repo shows this). The MME's SMS counterparts are SMS in MME over SGd, or the MSC over SGs. | Re-point the analogy (and the `analog` link) at `delivery-sgd`: "the 5G analogue of SMS in MME". |
| H5 | `src/data/flows/sa/idle.js:21` | "The SMF can re-anchor the user plane … the 5G equivalent of an S-GW relocation, and just as invisible to the UE." | Changing the anchor UPF (PSA) changes the UE's IP address and only happens in SSC modes 2 and 3 (TS 23.501 §5.6.9). The step that is invisible and matches an S-GW relocation is inserting or relocating an intermediate UPF (I-UPF), which keeps the PSA. | "…the SMF can insert or relocate an intermediate UPF while the anchor UPF, and the IP address, stay put: the 5G equivalent of an S-GW relocation." |
| H6 | `src/components/ReferencePanel.jsx:76` | "SMS needs none of them — it rides NAS signalling." | Contradicts the site's own 4G SMS flow, whose originating path is SMS over IP: a SIP MESSAGE on the QCI 5 bearer (`src/data/flows/fourg/sms.js:5`). | "SMS over NAS needs none of them; SMS over IP rides the QCI 5 signalling bearer." |

### Medium

| # | Where | What is wrong | Evidence / fix |
|---|---|---|---|
| M1 | `src/data/arch/sip.js:303` | Cites RFC 3261 §20.16 for the Content-Type header. | §20.16 is CSeq; Content-Type is §20.15. Add `r3261('20.15')`. Keep §20.16 too, because the scene also highlights CSeq. |
| M2 | `src/data/arch/sip.js:197` | The caller's SDP offer has `a=des:qos mandatory remote sendrecv`. | TS 24.229 §6.1.2: the originating UE uses "mandatory" for the local segment and "optional" (or per RFC 3312) for the remote one. Change to `a=des:qos optional remote sendrecv` and adjust the note on line 193 ("both are required"). |
| M3 | `src/data/flows/fourg/idle.js:19` | In a same-MME TAU, says "otherwise a Modify Bearer Request just records the new serving MME and TAI". | TS 23.401 §5.3.3.2 step 9: the Modify Bearer Request is sent "If the MME has changed". In the drawn case (same MME, same S-GW) none is needed unless location reporting is active. Reword, and consider whether the step should be drawn at all. |
| M4 | `src/data/arch/sansa.js:152` | "QoS flows identified by a 5QI". | The QFI identifies a QoS flow; the 5QI gives its QoS characteristics (TS 23.501 §5.7.1). "QoS flows, each with a 5QI". |
| M5 | `src/data/flows/fourg/voice-mt.js:19`, `src/data/flows/sa/voice-mt.js:21` | "This detour typically costs 100–300 ms." | No source given, and the figure probably understates it: the UE only listens at its paging occasion, so the wait depends on the DRX cycle (up to 2.56 s in LTE), on top of RRC and Service Request time. Drop the number, or say "from a few hundred milliseconds to over a second, depending mostly on the paging DRX cycle", as a `pitfall`. |
| M6 | `src/data/flows/fourg/data.js:15`, `src/data/reference/eirStatus.js:4` | "A blacklisted handset is rejected no matter how valid the SIM is" / "The MME rejects the attach". | TS 23.401 §5.3.2.1 step 5b: "Dependent upon the Result, the MME decides whether to continue with this Attach procedure or to reject." That is operator policy, not automatic. "…is normally rejected; the standard leaves the decision to the MME". |
| M7 | `src/data/flows/fourg/data.js:11,25`, `fourg/voice.js:9,11,15,23,25,36,38`, `fourg/voice-mt.js:23`, `fourg/sms.js:8,11`, `sa/data.js:11` | Vendor product and architecture claims ("Ericsson splits this under UDC", "SAPC answers", "Ericsson runs I-CSCF and S-CSCF as one CSCF node", "Ericsson ships it…") in step descriptions (`d`). | CLAUDE.md allows Ericsson names on Flows *diagram nodes*. Statements about how one vendor builds things are not 3GPP facts and should not sit in the mechanism text. Move them to `pitfall`, or use the 3GPP name in `d` ("the PCRF" rather than "SAPC"). |
| M8 | `src/data/flows/sa/sms.js:12,22`, `src/data/reference/glossary.js:39`, topology `smsf–smsc` link | States that the SMSF reaches the SMS centre over SGd, as if that were the only option, and "reused the same … Diameter application". | TS 23.501 §4.4.2 only says these interfaces "are still based on legacy protocol (i.e. MAP or Diameter)", and TS 23.502 has the SMSF registering "MAP address and/or Diameter address". The SGd name comes from TS 29.338, which isn't in the registry. Say "over MAP or Diameter (SGd)", and add TS 29.338 to the registry if you keep the SGd claim. The far end is the SMS-GMSC/IWMSC, not the SC itself. |
| M9 | `src/data/arch/epc.js:97,179`, `src/data/components/epc.js:39` | "The MME … never carries user data." | Not true for Control Plane CIoT EPS Optimisation (TS 23.401), where small data rides NAS through the MME and S11-U. Add "(except small IoT data, a later optimisation)", or limit the claim to smartphone traffic. |
| M10 | `src/data/arch/sip.js:147` | `Content-Length: 142` | The SDP body shown is 170 bytes with CRLF line endings. Change to 170. A learner who counts it will notice, and Content-Length errors are a real trace bug. |

### Low

| # | Where | Issue → suggested wording |
|---|---|---|
| L1 | `src/data/arch/sansa.js:189` | "Options 3, 3a and 3x differ only in where the user data is split": option 3a doesn't split. → "…differ only in where the user plane is terminated and split." |
| L2 | `src/data/arch/sansa.js` opt3x layout | Option 3x removes the eNodeB's S1-U. In practice the eNodeB keeps S1-U for MCG bearers such as the VoLTE QCI 1 bearer. Add a sentence to the scene; a diagram change is optional. |
| L3 | `src/data/components/fivegc.js:434` | "In 4G, SMS over NAS goes through the MME to an MSC (SGs), or via IMS." SMS over IMS isn't SMS over NAS. → "…to an MSC over SGs, or to the SMS centre over SGd (SMS in MME). SMS over IP through IMS is the other option." |
| L4 | `src/data/flows/sa/sms.js:8` | "exactly as 4G could do once SMS-in-MME shipped": SMS over NAS existed in 4G from the start, via SGs to the MSC. → "exactly as 4G does". |
| L5 | `src/data/reference/glossary.js:296` | CDR expanded as "Call Detail Record". 3GPP's term is **Charging Data Record** (TS 32.240, TS 32.298). Give both. |
| L6 | `src/data/reference/glossary.js:139` | NSA is defined as reusing the EPC. Options 4 and 7 are non-standalone with the 5GC. → "usually option 3: …; options 4 and 7 are NSA with the 5G core". |
| L7 | `src/data/reference/glossary.js:145` | SUCI as "encrypted IMSI". It conceals the SUPI, which may be an IMSI or an NAI, and the null scheme doesn't encrypt at all (TS 33.501 §6.12). |
| L8 | `src/data/reference/glossary.js:63` | MMSC "fetched by the handset over WAP" contradicts the MMS entry and flow (HTTP). → "over HTTP". |
| L9 | `src/data/arch/sip.js` codes panel | 403, 404 and 408 are in the table but not cited. Add RFC 3261 §21.4.4, §21.4.5 and §21.4.9. |
| L10 | `src/data/components/vignettes.js:354` | "For IMS, the network always starts this, not the phone." 3GPP allows UE-initiated requests; the "always" comes from the GSMA profiles. Cite IR.92/NG.114, or soften to "in VoLTE and VoNR profiles". |
| L11 | `src/data/reference/glossary.js:42` | The I-CSCF note mentions only routing incoming requests. Add S-CSCF assignment at registration, matching the component page. |
| L12 | `src/data/topologies/fragments.js` (`smsc–ipsmgw` "MAP / SGd") | The IP-SM-GW to SMS-GMSC/IWMSC interface is MAP (E/Gd). Check the SGd label against TS 29.338, or drop it, as for M8. |

## Confirmed correct

These are the claims I expected to be fragile. Each was checked against the spec text and is correct as written:

- TS 37.340 citations: §4.3.1.2 and §4.3.2.2 are "MR-DC with EPC", the right clauses for EN-DC.
- "Inbound, the IBCF is the entry point in place of the I-CSCF" is nearly verbatim from TS 23.228 §4.14 ("instead of the I-CSCF").
- I-CSCF converting user=phone SIP URIs to tel URIs before the HSS query (TS 23.228 §4.6.2).
- N41/N42 as AMF–CHF reference points (TS 23.501 §4.2.7, TS 32.240).
- MRFP floor control (TS 23.002 §4a.7.4a); UPF downlink buffering (TS 23.501 §6.2.3); NSSF determining the Configured NSSAI (§6.2.14); AF influence on service function chaining (§5.6.16).
- The QCI and 5QI delay budgets and loss rates in `src/data/reference/qos.js`, and QCI 5 at priority 1 in 4G.
- Codec rules: AMR and AMR-WB mandatory, EVS mandatory if super-wideband is offered (IR.92 §3.2.1); EVS mandatory for VoNR (NG.114 §3.2.1).
- TS 23.228 Annex Y.13 ("Subscription to EPS Fallback Event") supports "the P-CSCF can ask the PCF to be told".
- The SIP lesson's protocol mechanics: the >1300-byte TCP rule (§18.1.1), the hop-by-hop CANCEL and 487 handling, ACK for 2xx going to the Contact, and the dialog and transaction identifiers.

## Remediation plan

### Phase 1: correct the facts (one PR, about a day)

Fix H1–H6 and M1–M4, M6 and M10. Each is a text edit to a data file or `ReferencePanel.jsx`, using the wording in the tables above. H4 also changes an `analog` target. Then:

1. `npm test` (validators must stay at zero warnings), `npm run lint`, `npm run build`.
2. Spot-check the changed steps in the dev server: the SA voice step, the NSA data step, the SA SMS and SA idle steps, and the SIP lesson's anatomy and preconditions scenes.

### Phase 2: tighten the rest (one PR, about a day)

- M5: replace the unsourced latency figure, or move it to a `pitfall` with honest bounds.
- M7: move vendor statements out of `d` into `pitfall` across the Flows files, and use 3GPP names in mechanism text.
- M8 and L12: add TS 29.338 to `sources.js` and check the SGd wording against it, or generalise to "MAP or Diameter".
- M9, and L1–L11.

### Phase 3: stop it recurring

The cited content had almost no errors; the uncited Flows prose had most of them. These changes target that gap:

1. **Clause checker script** (`scripts/check-clauses.mjs`, run by hand, not in CI). Given a folder of spec text files you download yourself (ETSI's terms don't allow redistribution, so don't commit them), it resolves every `{ src, clause }` and prints the clause heading next to the scene or record that cites it. That turns this audit's citation pass into a two-minute job whenever `sources.js` is bumped to a new version.
2. **Optional `cites` on Flows steps.** Allow `cites: [{ src, clause }]` on a step and show it in the step panel. Start with the procedure clauses (TS 23.401 §5.3.2.1 attach, TS 23.502 §4.2.2.2 registration, §4.3.2 PDU session, §4.13.6.1 EPS fallback). The validator already knows the source ids.
3. **Validator lints** (warnings, which keep `npm test` honest given the zero-warning rule):
   - a vendor term (`Ericsson`, `SAPC`, `CUDB`, `MTAS`, `EPG`, `SBG`, `M-MGw`) in a step's `d` rather than `pitfall`, outside node labels;
   - a numeric performance claim (`\d+\s?(ms|s|seconds|%)`) in `d` with no `cites`, so figures like M5 have to be sourced or moved to `pitfall`.
4. **Check after every version bump.** When a spec in `sources.js` moves to a new version, run the clause checker, and re-read any clause whose title changed.

### Not done in this audit

- TS 29.338 (SGd for the SMSF and IP-SM-GW), TS 23.040, TS 24.301 and the OMA MMS specs aren't in the registry, so the claims that rest on them (M8, L12, the MMS steps, and the T3412 54-minute default) are checked against the cited 3GPP architecture specs only.
- The diagrams were checked for interface labels and endpoints, not for visual originality against third-party figures.
