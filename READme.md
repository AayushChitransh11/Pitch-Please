# Presentation Coach

**Prepare your message. Practice your delivery.**

Presentation Coach is a hackathon project that helps students turn their ideas into a clear presentation, rehearse aloud, and understand what to improve before presenting to an audience.

**[Open the application](https://pixel-perfect-render-24504.lovable.app)**

## The problem

Preparing for a presentation involves both deciding what to say and practicing how to deliver it. Students may have notes or slides but still struggle to organize their message, explain ideas for a particular audience, cover the required points, or stay within a time limit.

Practicing alone can leave an important gap: students do not always know what worked, what was missing, or what to change on their next attempt.

## Our solution

Presentation Coach brings preparation and rehearsal into one workflow:

1. **Give the presentation context.** Share the topic, audience, purpose, target duration, and required points.
2. **Develop the message.** Use that context as the basis for an outline and, in the planned coaching experience, a conversation with an AI coach.
3. **Practice aloud.** Rehearse using the practice interface.
4. **Review feedback.** The planned analysis identifies measurable delivery characteristics and suggests improvements grounded in the presentation context and transcript.
5. **Try again.** Use the feedback to guide the next rehearsal.

Our goal is to help users answer: **“What should I improve before my next presentation?”**

## Who it is for

- Students preparing for class presentations and project demonstrations.
- Hackathon teams practicing a pitch.
- Speakers who want to organize their ideas and rehearse for a specific audience.

## Current prototype

The published application is a frontend prototype. The following status reflects the visible pages reviewed on October 3, 2026; it does not establish that backend integrations are complete.

| Area | Current interface | Status |
| --- | --- | --- |
| Landing page | Product overview, preparation and practice entry points, and an example preview | Available |
| Presentation brief | Topic, audience, purpose, target duration, required points, and draft or notes | Form available |
| PDF attachment | Attachment control displaying a 10 MB limit | Interface available; parsing is not verified |
| Coach chat | Dedicated coaching panel | Marked coming soon |
| Practice | Camera and microphone start control | Interface available; media behavior is not verified here |
| Rehearsal analysis | Notice about sending a rehearsal for analysis | Marked coming soon |
| Sample report | Link from the practice page | Demonstration entry point; not evidence of live analysis |

Example previews and sample reports should be treated as demonstration data until the live analysis integration is complete.

## Presentation context

The presentation brief provides the basis for meaningful feedback.

| Input | Purpose |
| --- | --- |
| Topic | Establish what the presentation is about |
| Audience | Adapt explanations to the people listening |
| Purpose | Identify what the speaker wants the audience to understand or do |
| Target duration | Compare the rehearsal with the time limit |
| Required points | Check whether the presentation addresses its intended content |
| Draft, notes, or supporting PDF | Supply background material for preparation |
| Rehearsal audio | Supply speech for transcription and delivery measurements |

The current practice interface also includes a camera control. Camera access alone does not provide eye-contact, posture, or body-language analysis; those are outside the initial evaluation scope.

## Planned evaluation and results

The first analysis workflow focuses on five dimensions:

| Dimension | Basis for evaluation | Example result |
| --- | --- | --- |
| Timing | Recording duration compared with the target | “2:42 of 3:00 — 18 seconds remaining” |
| Speaking pace | Transcript word count divided by recording duration in minutes | “132 words per minute” |
| Content coverage | Transcript compared with the required points | “Your explanation of the student benefit is missing” |
| Organization | Opening, progression of ideas, and conclusion in the transcript | “End with a clear takeaway” |
| Audience clarity | Explanations assessed against the audience and purpose | “Explain this technical term before using it” |

Timing and pace are calculated measurements. Coverage, organization, and clarity are AI assessments and should include evidence and actionable suggestions. Unclear transcription should produce uncertainty rather than an automatic negative judgment.

The results experience is designed to include:

- A transcript of the rehearsal.
- Actual duration, target duration, and average speaking pace.
- A checklist of required points marked covered, partial, missing, or uncertain.
- Strengths supported by the transcript.
- A short, prioritized list of improvements.
- Options to edit the brief or practice again.

We prioritize specific feedback over an unexplained overall score. Filler-word analysis can be added once the transcription service is confirmed to preserve those words. The initial prototype does not claim scientifically validated scoring or infer a speaker’s confidence.

## Intended application architecture

The frontend collects context, presents the coaching conversation, captures rehearsal input, and displays results. The backend maintains presentation context, handles media, coordinates transcription and coaching, and returns structured results.

| Component | Responsibility |
| --- | --- |
| Frontend | Presentation form, chat interface, rehearsal controls, loading and error states, and results |
| Backend API | Session context, input validation, media handling, and coordination of analysis |
| Transcription service | Convert rehearsal audio into text |
| Metrics logic | Calculate duration comparisons and speaking pace |
| Coaching service | Assess the transcript against the brief and generate supported suggestions |

Microsoft Azure was proposed for speech processing during planning. The deployed interface does not confirm the provider or integration status. Provider credentials belong on the server.

Preparation context should remain associated with each rehearsal so feedback reflects the user's actual audience, goal, and required points.

## Try the prototype

1. Open the [application](https://pixel-perfect-render-24504.lovable.app).
2. Select **Prepare my presentation**.
3. Complete the presentation brief with a topic, audience, purpose, target duration, and required points.
4. Use **Save brief & continue to practice** to enter the rehearsal flow.
5. Explore the camera and microphone entry point and the sample-report link.

The practice page states that camera and microphone access is requested when the user presses start. Live coaching and rehearsal submission are marked coming soon.

## Development priorities

- [ ] Connect the preparation chat to a context-aware coaching service.
- [ ] Implement and verify rehearsal capture and upload.
- [ ] Connect speech transcription and calculate duration and pace.
- [ ] Assess content coverage, organization, and audience clarity.
- [ ] Replace sample results with validated backend responses.
- [ ] Verify PDF processing and how extracted content informs coaching.
- [ ] Test the full preparation-to-feedback workflow and recovery from failed requests.

Future extensions could include practice-history comparisons and audience Q&A rehearsal.

## Team responsibilities

The project is organized for a team of four:

| Owner | Focus |
| --- | --- |
| Nathanael | Frontend experience and integration, then support for other teammates |
| Backend teammate | API routes, sessions, media handling, and integration |
| Speech-processing teammate | Transcription and calculated metrics |
| Coaching teammate | Preparation chat, transcript feedback, and demo narrative |

## Local development

The application is published through Lovable. Repository-specific installation commands, dependencies, environment variables, and backend configuration need to be documented from the source repository before local setup instructions can be provided accurately.

