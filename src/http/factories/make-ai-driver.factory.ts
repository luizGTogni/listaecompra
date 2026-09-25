import { env } from '@/config/env.js'
import { AiDriver } from '@/drivers/ai/ai.driver.js'
import { MockAiDriver } from '@/drivers/ai/mock-ai.driver.js'
import { NvidiaNimAiDriver } from '@/drivers/ai/nvidia-nim-ai.driver.js'

export function makeAiDriver(): AiDriver {
  return env.NODE_ENV === 'test' ? new MockAiDriver() : new NvidiaNimAiDriver()
}
