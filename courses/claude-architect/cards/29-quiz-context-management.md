---
id: card_73e8b2d5
type: quiz
order: 29
difficulty: 3
title: "Quiz: Context Management and Reliability"
domain: "Context Management & Reliability"
wiki_refs: ["Context Window", "Auto-compaction"]
pass_threshold: 0.8
questions:
  - prompt: "A support agent uses progressive summarization on a long conversation. After several rounds, it refers to the customer's issue as 'a billing problem.' What was lost?"
    objective: "Understand the silent data loss caused by progressive summarization"
    source: "raw/context-management-reliability.md"
    choices:
      - text: "Specific details like customer name, account number, order ID, and exact amounts — progressive summarization silently destroys critical specifics"
        correct: true
      - text: "Nothing important — summaries are designed to capture the key points of any conversation"
        correct: false
        misconception: "Assumes summarization preserves all important information, when in reality each round loses specifics like identifiers, amounts, and dates"
      - text: "Only formatting was lost — the underlying facts remain intact in the summary"
        correct: false
        misconception: "Believes summarization only changes structure and presentation while preserving data, ignoring that specifics are irreversibly discarded"
      - text: "The details can be recovered by asking the customer to repeat their information"
        correct: false
        misconception: "Treats re-asking the customer as an acceptable workaround, ignoring the poor user experience and the fact that the system should have retained this data"
  - prompt: "A multi-agent system reports '95% overall accuracy' across document types. Why might this be misleading?"
    objective: "Recognize the difference between aggregate and stratified metrics"
    source: "raw/context-management-reliability.md"
    choices:
      - text: "Aggregate metrics mask per-category failures — invoices could be at 70% while receipts at 99.8%, still averaging to 95%"
        correct: true
      - text: "95% is always a good accuracy metric for any production AI system"
        correct: false
        misconception: "Accepts aggregate metrics at face value without considering how they might hide poor performance on specific categories or edge cases"
      - text: "The metric should be measured on a larger sample size to be meaningful"
        correct: false
        misconception: "Focuses on sample size as the issue rather than recognizing that the aggregation method itself obscures important per-category differences"
      - text: "Accuracy should be measured using a different methodology for AI systems compared to traditional software"
        correct: false
        misconception: "Gets distracted by methodology concerns rather than identifying the core problem of aggregate vs. stratified measurement"
  - prompt: "An angry customer contacts support about a simple password reset. Should the agent escalate to a human?"
    objective: "Distinguish between sentiment-based and task-based escalation triggers"
    source: "raw/context-management-reliability.md"
    choices:
      - text: "No — sentiment alone does not equal task complexity. This is a simple request the agent can handle regardless of the customer's tone"
        correct: true
      - text: "Yes — angry customers always need human agents to de-escalate the situation"
        correct: false
        misconception: "Uses sentiment as an automatic escalation trigger, leading to over-escalation and unnecessary human workload for simple tasks"
      - text: "Yes — escalating avoids the risk of making the customer even angrier"
        correct: false
        misconception: "Prioritizes emotional management over task assessment, not recognizing that quick automated resolution often satisfies customers faster than a transfer"
      - text: "Yes — escalation is always the safer choice when there is any doubt"
        correct: false
        misconception: "Views over-escalation as risk-free, ignoring that unnecessary escalations increase wait times, human workload, and often result in worse customer outcomes"
---
