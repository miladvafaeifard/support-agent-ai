import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { LearningService } from "./learning.service";

@Processor("learning")
export class LearningProcessor extends WorkerHost {
  constructor(private learningService: LearningService) {
    super();
  }

  async process(job: Job) {
    // TODO: load ticket question + final answer, then:
    // await this.learningService.capture(question, answer);
    return { captured: true, ticketId: job.data.ticketId };
  }
}
