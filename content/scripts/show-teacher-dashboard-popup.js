$(document).ready(() => {
  const popupId = 'duo-tdp-container'

  // Show/hide
  if ($(`#${popupId}`).length === 0) {
    console.log('Duo: Showing teacher dashboard popup.')
    $.get(chrome.runtime.getURL('content/html/teacher-dashboard-popup.html'), data => {
      $(data).appendTo('body')
      const popup = $(`#${popupId}`)

      // Get class
      const classId = _getClassId()
      if (!classId) return

      chrome.runtime.sendMessage({action: 'com.duo.getClassByKAID', payload: {
        kaId: classId
      }}, data => {
        if (data.error) {
          if (data.status === 404) 
            setSubtitle(popup, `No class found for id ${classId}`)
          else
            flashError(popup, data.error)

          return
        }
        
        // Update UI
        show(popup.find('#duo-teacher-dashboard-popup-buttons'))
        setSubtitle(popup, `Class recognized: ${data.name}`)

        $('#duo-identify-students-button').click(() => {
          const students = _scrapeStudents()
          _displayStudentsInPopup(students)
          _fetchDuoStudentsAndUpdateList(data.id, students)
        })

        $('#duo-tdp-stu-title-bar').click(() => {
          const list = $('#duo-tdp-stu-list')
          const hidden = isHidden(list)
          const expandIcon = $('#duo-tdp-stu-list-expand-icon')
          hidden ? show(list) : hide(list)
          hidden ? hide(expandIcon) : show(expandIcon)
        })

        $('#duo-tdp-scrape-button').click(() => {
          _expandProgressBuckets()
          completions = _scrapeStudentProgress()
          sendMessage('com.duo.uploadTeacherDashboardCompletions', { completions }, data => {
            if (data.error)
              return flashError(popup, data.error)

            if (data.unrecognized_students.length > 0)
              return flashError(popup, `Data synced. Unrecognized students: ${data.unrecognized_students.join(', ')}`)

            flashSuccess(popup, `All student data uploaded.\n${new Date()}`)
          })
        })
      })
    })
  } else {
    return
  }
})

/**
 * PRIVATE METHODS
 * ===============
 * ===============
 */

/**
 * Fetches the class ID from the url
 */
function _getClassId() {
  const pathComponents = location.pathname.split('/')
  for (let i = 0; i < pathComponents.length; i++)
    if (pathComponents[i] === 'class' && i + 1 < pathComponents.length)
      return pathComponents[i + 1]
  
  return null
}

/**
 * Fetches the unit name from the title
 */
function _getUnit() {
  const title = $('h3').first()
  return title.text()
}

/**
 * Scraping & Identifying Students
 * ===============================
 */

/**
 * Scrapes student names from the top of the page.
 * 
 * @returns {String[]} A list of student names
 */
function _scrapeStudents() {
  const studentNamesString = $('div[data-test-id="student-mastery-score"]').text()
  const delimiterRegex = RegExp('[0-9]+%')
  return studentNamesString.split(delimiterRegex).filter(x => x)
}

/**
 * Displays students in the panel
 */
function _displayStudentsInPopup(students) {
  const container = $('#duo-tdp-stu-list-container')
  const list = container.find('ul')
  list.empty()
  list.html(students.map(name => _getStudentListItem(name)))
  show(container)
}

/**
 * @param {String} student 
 * @returns {String} HTML string of a list item for this student.
 */
function _getStudentListItem(student, email, error) {
  return `
    <li id='${_getStudentListItemId(student || email)}' class='duo-tdp-student-li'>
      <div>
        ${student}
        <span class='error-text'>${error || ''}</span>
      </div>
      <div id='${_getStudentEmailId(student || email)}' class='duo-tdp-student-email'>
        ${email || 'No email'}
      </div>
    </li>
  `
}

/**
 * FetcheS Duo student data & updates the student list. 
 * 
 * 1. If the student in on both Duo and KA, it will fill in their email
 * 2. If the student has a KA account but is not on Duo it will show an error for them
 * 3. If the student is on Duo but not KA it will add a new student with an error.
 */
function _fetchDuoStudentsAndUpdateList(duoClassId, kaStudents) {
  chrome.runtime.sendMessage({action: 'com.duo.fetchStudentsInClass', payload: {
    classId: duoClassId
  }}, data => {
    if (data.error)
      return flashError(data.error)

    // Maps student names => objects
    const studentMap = data.reduce((acc, next) => {
      acc[next.name] = next
      return acc
    }, {})

    for (let name of kaStudents) {
      const duoStudent = studentMap[name]
      if (duoStudent) {
        $(`#${_getStudentEmailId(name)}`).text(duoStudent.email)
        delete studentMap[name]
      } else {
        const li = $(`#${_getStudentListItemId(name)}`)
        li.find('.error-text').text('Not in Duo')
      }
    }

    const list = $('#duo-tdp-stu-list-container').find('ul')
    const itemsHTML = Object.values(studentMap).map(student => {
      return _getStudentListItem(student.name, student.email, 'Not in KA')
    })
    list.append(itemsHTML)
  })
}

/**
 * Gets the DOM ID of the list item for this student
 * 
 * @param {String} student 
 */
function _getStudentListItemId(student) {
  const stripped = student.replace(/\s/g, '')
  return `duo-tdp-s-li-${stripped}`
}

 /**
  * Gets the DOM ID of the element containing a given student's email
  * 
  * @param {String} student The name of the student
  */
function _getStudentEmailId(student) {
  const stripped = student.replace(/\s/g, '')
  return `duo-tdp-s-email-${stripped}`
}

 
/**
 * Scraping Skill Data
 * ===================
 */

 /**
  * Clicks on each progress bucket to expand them & display the student names.
  */
function _expandProgressBuckets() {
  const id = '[data-test-id="progress-bucket-table-row-toggle"]'
  const style = '[style="transform\\: rotate(0deg);"]'
  const closedBucketToggles = $(`div${id}${style}`)
  closedBucketToggles.click()
}

/**
 * Scrapes student progress from the (expanded) buckets.
 * 
 * @param nameMappings A mapping of student name => mapping. The mapping will be
 * missing the user_id; this is expected by the backend.
 */
function _scrapeStudentProgress() {
  const progressBuckets = $('div[data-test-id^="progress-bucket-table-row"]')
    .filter((_, el) =>
      $(el).attr('data-test-id') !== 'progress-bucket-table-row-toggle'
    )

  const unit = _getUnit()
  const completions = {}
  progressBuckets.each((_, bucket) => {
    // 2 children: headers & body
    if ($(bucket).children().length !== 2) return

    // Get skill name
    const headers = $(bucket).children(':first')
    const skill = headers.children(':first').text()
    
    // Get students in each mastery category
    const categories = $(bucket).children(':nth-child(2)')
    categories.children().each((_, category) => {
      const id = $(category).attr('data-test-id')
      if (!id) return

      // IDs are formatted 'progress-bucket-{category}-students'
      const masteryCategory = id.split('-')[2]

      $(category).children().first().children().each((_, student) => {
        const studentName = $(student).text()
        if (!completions[studentName])
          completions[studentName] = []

        completions[studentName].push({
          unit,
          skill,
          mastery_category: masteryCategory,
          recorded_from: 'teacher_dashboard'
        })
      })
    })
  })

  return completions
}