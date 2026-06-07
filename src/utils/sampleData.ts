import type { InterviewQuestion } from '../types/question';

export const sampleQuestions: InterviewQuestion[] = [
  {
    id: 'sample-1',
    title: '什么是闭包？',
    content: '请解释 JavaScript 中闭包的概念及其应用场景。',
    category: 'JavaScript',
    tags: ['JavaScript', '闭包', '作用域'],
    difficulty: '简单',
    answerPoints: [
      '函数可以访问定义时所在作用域中的变量',
      '外层函数执行结束后，内部函数仍可以访问外层变量',
      '常用于数据私有化、状态保存等场景',
    ],
    referenceAnswer:
      '闭包是指函数能够访问其词法作用域中的变量，即使这个函数在其词法作用域之外执行。常见场景包括函数返回函数、回调函数、事件处理函数等。闭包可以实现数据私有化和状态保存，但使用不当可能导致内存无法及时释放。',
    userAnswer: '',
    favorite: false,
    masteryStatus: '未开始',
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
  },
  {
    id: 'sample-2',
    title: '说一下事件循环',
    content: '请描述 JavaScript 事件循环的工作原理。',
    category: 'JavaScript',
    tags: ['JavaScript', 'Event Loop', '宏任务', '微任务'],
    difficulty: '中等',
    answerPoints: [
      'JavaScript 是单线程执行的',
      '同步任务先执行',
      '异步任务进入任务队列',
      '微任务优先于下一轮宏任务执行',
    ],
    referenceAnswer:
      '事件循环是 JavaScript 处理同步任务和异步任务的机制。同步任务会先进入调用栈执行，异步任务完成后会进入任务队列。每一轮事件循环中，会先执行一个宏任务，然后清空当前所有微任务，再进入下一轮循环。',
    userAnswer: '',
    favorite: false,
    masteryStatus: '未开始',
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
  },
  {
    id: 'sample-3',
    title: 'Vue2 和 Vue3 响应式原理有什么区别？',
    content: '请对比 Vue2 和 Vue3 在响应式实现上的差异。',
    category: 'Vue',
    tags: ['Vue', '响应式', 'Proxy', 'Object.defineProperty'],
    difficulty: '困难',
    answerPoints: [
      'Vue2 使用 Object.defineProperty',
      'Vue3 使用 Proxy',
      'Vue2 对新增属性和数组下标监听有限制',
      'Vue3 可以监听更多操作',
    ],
    referenceAnswer:
      'Vue2 的响应式基于 Object.defineProperty，通过 getter 和 setter 劫持对象已有属性，因此对新增属性、删除属性以及数组下标修改存在限制。Vue3 使用 Proxy 代理整个对象，可以监听更多操作，响应式能力更完整。',
    userAnswer: '',
    favorite: false,
    masteryStatus: '未开始',
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
  },
];
