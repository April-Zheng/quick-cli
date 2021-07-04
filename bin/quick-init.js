#!/usr/bin/env node

const fs = require('fs')
const inquirer = require('inquirer')

const program = require('commander')
const chalk = require('chalk')
const ora = require('ora')
const download = require('download-git-repo')
const tplObj = require(`${__dirname}/../template`)
// program.usage('<template-name> [project-name]')
program.parse(process.argv)
// // 当没有输入参数的时候给个提示
// if (program.args.length < 1) return program.help()

// 好比 vue init webpack project-name 的命令一样，第一个参数是 webpack，第二个参数是 project-name

const templateChoices = Object.keys(tplObj)

if (templateChoices.length < 1) {
  console.log(chalk.red('\n Templates is empty! \n '))
  console.log(chalk.red('\n use quick-add to create template \n '))
  return
}

const downTemplate = (templateName, projectName) => {
  // 小小校验一下参数
  if (!tplObj[templateName]) {
    console.log(chalk.red('\n Template does not exit! \n '))
    return
  }
  if (!projectName) {
    console.log(chalk.red('\n Project should not be empty! \n '))
    return
  }

  if (fs.existsSync(projectName)) {
    console.log(chalk.red('\n Project already exists! \n '))
    return
  }

  url = tplObj[templateName]

  console.log(chalk.white('\n Start generating... \n'))
  // 出现加载图标
  const spinner = ora('Downloading...')
  spinner.start()
  try {
    // 执行下载方法并传入参数
    download(url, projectName, (err) => {
      if (err) {
        spinner.fail()
        console.log(chalk.red(`Generation failed. ${err}`))
        return
      }
      // 读取下载下来的package.json 修改package name
      const packageJSONPath = projectName + '/package.json'
      try {
        fs.readFile(packageJSONPath, 'utf-8', (err, data) => {
          if (err) {
            chalk.white('\n read file error \n', err)
            return
          }
          const fileContent = JSON.parse(data)
          fs.writeFileSync(
            packageJSONPath,
            JSON.stringify({ ...fileContent, name: projectName }, null, 2),
            (err) => {
              chalk.white('\n write file error \n', err)
            }
          )
        })
      } catch (error) {
        chalk.white('\n change package name \n', err)
      }

      // 结束加载图标
      spinner.succeed()
      console.log(chalk.cyan('\n Generation completed!'))
      console.log(chalk.cyan('\n To get started'))
      console.log(chalk.cyan(`\n    cd ${projectName} \n`))
      console.log(chalk.cyan(`\n    npm install \n`))
    })
  } catch (error) {
    spinner.fail()
    console.log(chalk.red(`Generation failed. ${error}`))
    return
  }
}

if (program.args.length === 2) {
  const [templateName, projectName] = program.args
  downTemplate(templateName, projectName)
  return
}

const question = [
  // 选择模式使用 page -> 创建页面 | component -> 创建组件
  {
    type: 'list',
    name: 'templateName',
    message: '选择想要创建的模版',
    choices: templateChoices,
  },

  // 设置名称
  {
    type: 'input',
    name: 'projectName',
    message: (answer) => `输入项目名称`,
    validate(val) {
      if (val === '') return 'The url is required!'
      return true
    },
  },
]
inquirer.prompt(question).then((answers) => {
  const { templateName, projectName } = answers
  downTemplate(templateName, projectName)
})
