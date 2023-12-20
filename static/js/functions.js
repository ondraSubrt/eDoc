async function loadData(){
    console.log("loadData running")
    try {
        const userId = 2 //localStorage.getItem('appData') ? JSON.parse(atob(localStorage.getItem('appData'))) : false
        if (userId) {
            const projectsData = localStorage.getItem('projectsData') ? JSON.parse(localStorage.getItem('projectsData')) : false
            if (!projectsData) {
                const response = await fetch('/getData');
                const data = await response.json()
                localStorage.setItem('projectsData', JSON.stringify(data.projects))
                localStorage.setItem('appData', btoa(data['_id'])) // TODO - move to login
                return data.projects
            } else {
                return projectsData
            } 
        } else {
            alert('you need to log in first')
            var errorMessage = document.createElement('div')
            errorMessage.id = 'error-message'
            errorMessage.innerHTML = '<span> log in here, you slald <a href=/login>log in</a></span>'
            const parent = document.getElementsByName('body')[0]
            document.body.appendChild(errorMessage)
            return null 
        } 

    } catch(err) {
        console.error(err)
        return null
    }
}

function setCookie(name, value, daysToExpire, sameSiteOption = 'Lax') {
    const expires = new Date();
    expires.setDate(expires.getDate() + daysToExpire);
    const cookieString = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=${sameSiteOption};Secure`;
    document.cookie = cookieString;
  }


function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
        const [cookieName, cookieValue] = cookie.trim().split('=');
        if (cookieName === name) {
            return decodeURIComponent(cookieValue);
        }
    }
return null; // Cookie not found
}

function cre(parent, element, options) {
    var child = document.createElement(element)
    var parent = document.getElementById(parent)
    for (var o in options) {
        switch (o) {
            case 'class':
                child.className += options[o]
                break;
            case 'data':
                for (var att in options[o]) {
                    child.dataset[att] = options[o][att]
                }
                break;
            default:
                if(child[o] !== 'undefined') {
                    child[o] = options[o]
                }     
                break;
        }
    }
    parent.appendChild(child)
    return child
}

function getProperties(obj, structure, dataType = 'object') {
    if (structure.length === 0) {
        return {
            data: obj, 
            type: dataType // Reached the desired property
        }       
    }
    const currentKey = structure.shift();
    if (obj && obj[currentKey] && obj[currentKey].properties) {
        console.log(currentKey)
        return getProperties(obj[currentKey].properties, structure, 'object');
    } else if ((obj && obj[currentKey] && obj[currentKey].items)) {
        console.log(currentKey)
        return getProperties(obj[currentKey].items.properties, structure, 'array')
    }

    return {}; // Property not found
}

function getRequired(obj, structure) {
    console.log('getRequired started');
    if (structure.length === 0) {
        if (Array.isArray(obj)) {
            return obj       
        } else {
            return []
        }
    }
    const currentKey = structure.shift();
    if (obj && obj[currentKey] && obj[currentKey].properties) {
        console.log(currentKey)
        if (structure.length === 0) {
            return getRequired(obj[currentKey].required, structure);
        } else {
            return getRequired(obj[currentKey].properties, structure);
        }
    } else if (obj && obj[currentKey] && obj[currentKey].items) {
        console.log(currentKey)
        if (structure.length === 0) {
            return getRequired(obj[currentKey].items.required, structure)
        } else {
            return getRequired(obj[currentKey].items.properties, structure)
        }
    }

    return {}; // Property not found
}

function getDataType(data) {
    if (typeof data === 'string') {
      return 'string';
    } else if (typeof data === 'number') {
      return 'number';
    } else if (data instanceof Array) {
      return 'array';
    } else if (typeof data === 'object' && data !== null) {
      return 'object';
    } else if (data === null) {
      return 'null';
    } else if (typeof data === 'boolean') {
      return 'boolean';
    } else {
      return 'unknown';
    }
  }

function dataTypeShort(dataType){
    switch (dataType) {
        case 'string': return 'T'
        case 'number': return '#'                               
        case 'array': return '[]'
        case 'object': return '{}'                               
        case 'boolean': return 't/f'
        case 'reference': return 'ref'   
    }
}

function removeProperty(id) { 
    const removeButtonId = 'remove-property-' + id
    document.getElementById(removeButtonId).addEventListener('click', () => {
        console.log(id);
        document.getElementById('property-' + id).remove()
        delete window._evObj.properties[id]
        const index = window._evObj.required.indexOf(id)
        if (index > 0) {
            window._evObj.required.splice(index,1)
        }

    })  
}

function updateProperty(id) { 
    let infoObj = {}
    // load new values
    
    const propertyName = document.getElementById('name-' + id) ? document.getElementById('name-' + id).value : ''
    const examples = document.getElementById('examples-' + id) ? document.getElementById('examples-' + id).value : ''
    const description = document.getElementById('description-' + id) ? document.getElementById('description-' + id).value : ''
    const mandatory = document.getElementById('checkbox-' + id) ? document.getElementById('checkbox-' + id).checked : false
    let dataType = ""
    if (document.getElementById('data-types-' + id)) {
        const checked = Array.from(document.getElementById('data-types-' + id).querySelectorAll('input')).filter((input) => input.checked) 
        dataType = checked[0].dataset.value
    } 
    
    // prepare the object from values
    infoObj = {
        name: propertyName,
        mandatory: mandatory,
        data: {
            examples: examples,
            description: description,
            type: dataType
        }
    }

    // update the values for property propertiesObject
    window._evObj.properties[infoObj.name] = infoObj.data
    if (infoObj.mandatory) {
        if (window._evObj.required && !window._evObj.required.includes(infoObj.name)) {
            window._evObj.required.push(infoObj.name)
        }  
    } else {
        if (window._evObj.required && window._evObj.required.includes(infoObj.name)) {
            const index = window._evObj.required.indexOf(id)
            if (index > 0) {
                window._evObj.required.splice(index,1)
            }
        }      
    }

    // update the values on the page HTML in edit view    
    const propertyNameValue = document.getElementById('name-' + id)
    propertyNameValue.value = propertyName

    const examplesValue = document.getElementById('examples-' + id)
    examplesValue.value = examples
    const descriptionValue = document.getElementById('description-' + id)
    descriptionValue.value = description
    const mandatoryValue = document.getElementById('checkbox-' + id)
    mandatoryValue.checked = mandatory
    if (document.getElementById('data-types-' + id)) {
        const checked = Array.from(document.getElementById('data-types-' + id).querySelectorAll('input')).filter((input) => input.dataset.value === dataType) 
        checked[0] = true
    }
    
    // update the values on the page HTML in list view  
    const listName = document.getElementById('list-property-name-' + id)
    listName.innerHTML = '<b>' + propertyName + '</b>: '

    const listExamples = document.getElementById('list-property-value-' + id)
    listExamples.innerHTML = examples
    
    const listMandatory = document.getElementById('list-property-required-' + id)
    if (listMandatory.classList.contains('invisible') && mandatory) {
        listMandatory.classList.remove('invisible')
    } else if (!listMandatory.classList.contains('invisible') && !mandatory) {
        listMandatory.classList.add('invisible')
    } 

    const listDataType = document.getElementById('list-property-data-type-' + id)
    listDataType.innerHTML = dataTypeShort(dataType)
    document.querySelectorAll('.toggle-' + id).forEach(div => div.classList.toggle('visible'))        
}

function updateAllProperties() {
    console.log('updateAllProperties running');
    const allProperties = document.querySelectorAll('[data-type="property-box"]')
    console.log(allProperties);
    allProperties.forEach((property) => {
        const propertyId = property.id.split('-')[2]
        console.log(propertyId)
        updateProperty(propertyId)
    })
    document.getElementById('save-properties-update').classList.remove('visible')
    document.getElementById('edit-all').classList.add('visible')
}
  
function editAll() {
    console.log('editAll running');
    const toggleableDivs = document.querySelectorAll('.toggleable');
    toggleableDivs.forEach((div) => {
        if (div.dataset.view == 'list' && div.classList.contains('visible')) {
            div.classList.remove('visible');
        } else if (div.dataset.view == 'edit' && !div.classList.contains('visible')) {
            div.classList.add('visible');
        }
    }) 
}

function editOne(cl) {
   
    const toggleableDivs = document.querySelectorAll('.' + cl);
    toggleableDivs.forEach(div => div.classList.toggle('visible'));
  }

function getExampleContext(obj) {
    let exampleContext = {}
   
    for (let prop in obj){
        exampleContext[prop] = obj[prop].examples[0]
    }
    return exampleContext
}

function getExampleEvent(structure, obj) { 
  if (structure.length === 0) {
    return obj;
  }

  const key = structure[0];
  const nestedObject = getExampleEvent(structure.slice(1), obj);
  let result = {}
  result = { [key]: nestedObject }
  return result;
}

function getSchema(obj, structure, context, required) {
    return Object.values(obj).reduce((output, value) => {
        const structureKey = structure.splice(0,1)
        if (structure.length) {
            let prop = output[structureKey[0]] = output[structureKey[0]] || {}
            prop.required = [structure[0]]
            prop.type = 'object'
            prop.additionalProperities = false
            prop.properties = getSchema(value, structure, context, required)
        } else {
            let contextObject = {}
            for (var p in context) {
                console.log(p);
                contextObject[p] = {}
                for (var sp in context[p]) {
                    console.log(sp);
                    contextObject[p][sp] = context[p][sp] 
                }
            }
            if(Array.isArray(value)) {
                let con = output[structureKey[0]] = {}
                con.type = 'array'
                con.items = {}
                con.items.required = required
                con.items.type = 'object'
                con.items.properties = contextObject
            } else {
                output[structureKey[0]] = contextObject
            }
                
        }
        return output
    }, output = {})
}

// TODO - handle the types (reference, global) later
function createSchema(evObj, type = 'event') { 
    const props = evObj.properties
    const struct = evObj.structure
    const requiredProps = evObj.required
    const dataType = evObj.contextType
    const exampleEvent = evObj.contextObj

    let schema = {}
    schema['$schema'] = 'https://json-schema.org/draft/2019-09/schema' 
    schema.description = struct.join('.') + ' schema' 
    schema.type = 'object'
    schema.required = type === 'event' ? ['event', struct[0]] : [struct[0]] 
    if (type === 'event') {
        let ev = {
            event: {
                type: 'string',
                description: "event name", // TODO - how to get description for the event
                pattern: "^" + struct.join('.') + "$" 
            }
        }
        schema.properties = {...ev, ...getSchema(exampleEvent, [...struct], props, requiredProps)}
    } else {
        schema.properties = {} 
    }
    
    schema.additionalProperities = false
    return schema    

}

function listProperties(propertiesObject, divId) {
    Object.entries(propertiesObject).forEach(([key, value]) => {
        const dataType = getDataType(value.examples[0])
        const options = {
            id: 'property-' + key,
            innerHTML: `
            <div class="container" id="property-box-${key}" data-type="property-box">
                <div data-view="edit" id="property-box-edit-${key}" class="toggle-${key} toggleable card p-2">
                    <div class="row">
                        <div class="col-md-6">
                            <div class="">
                                <label class="form-label px-2 small" for="name-${key}">property name</label>
                                <input class="form-control" type="text" id="name-${key}" value="${key}" data-export="name">
                            </div>
                        </div>
                        <div class="col-md-6 text-end">
                            <div id="data-types-${key}" class="btn-group" role="group" aria-label="Radio Buttons" data-export="type">
                                <input type="radio" class="btn-check" name="options-${key}" id="option1-${key}" data-value="string"
                                    autocomplete="off" ${dataType=='string' ? 'checked' : '' }>
                                <label class="btn btn-outline-primary btn-sm btn-radio rounded" for="option1-${key}">T</label>

                                <input type="radio" class="btn-check" name="options-${key}" id="option2-${key}" data-value="number"
                                    autocomplete="off" ${dataType=='number' ? 'checked' : '' }>
                                <label class="btn btn-outline-primary btn-sm btn-radio rounded" for="option2-${key}">#</label>

                                <input type="radio" class="btn-check" name="options-${key}" id="option3-${key}" data-value="array"
                                    autocomplete="off" ${dataType=='array' ? 'checked' : '' }>
                                <label class="btn btn-outline-primary btn-sm btn-radio rounded" for="option3-${key}">[]</label>

                                <input type="radio" class="btn-check" name="options-${key}" id="option4-${key}" data-value="object"
                                    autocomplete="off" ${dataType=='object' ? 'checked' : '' }>
                                <label class="btn btn-outline-primary btn-sm btn-radio rounded" for="option4-${key}">{}</label>

                                <input type="radio" class="btn-check" name="options-${key}" id="option5-${key}" data-value="boolean"
                                    autocomplete="off" ${dataType=='boolean' ? 'checked' : '' }>
                                <label class="btn btn-outline-primary btn-sm btn-radio rounded" for="option5-${key}">t/f</label>

                                <input type="radio" class="btn-check" name="options-${key}" id="option6-${key}"
                                    data-value="reference" autocomplete="off" ${dataType=='reference' ? 'checked' : '' }>
                                <label class="btn btn-outline-primary btn-sm btn-radio rounded" for="option6-${key}">ref</label>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-12">
                            <label class="form-label px-2 small" for="examples-${key}">examples</label>
                            <input class="form-control" type="text" id="examples-${key}" name="${key}" value="${value.examples}"
                                data-export="examples">
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-12">
                            <label class="form-label px-2 small" for="description-${key}">description</label>
                            <textarea class="form-control" id="description-${key}" data-export="description">${value.description}</textarea>
                        </div>
                    </div>
                    <div data-view="list" class="row pt-2">
                        <div class="col-md-6">
                            <input type="checkbox" id="checkbox-${key}" data-export="mandatory" checked>
                            <label for="checkbox-${key}">mandatory</label>
                        </div>
                        <div class="col-md-6">
                            <div class="text-end">
                                <button class="btn btn-outline-success btn-sm rounded" id="update-property-${key}" onclick="updateProperty('${key}')">update</button>
                                <button class="btn btn-outline-danger btn-sm rounded" id="remove-property-${key}">remove</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div data-view="list" id="property-box-list-${key}" class="toggle-${key} toggleable visible card p-2">
                    <div class="row">
                        <div class="col-md-12">
                            <div class="row">
                                <div class="col-md-8">
                                    <div class="row">
                                        <div class="col-md-12 div-text-wrap">
                                            <span id="list-property-name-${key}" class=""><b>${key}: </b></span><span id="list-property-value-${key}" class="div-text-wrap text-muted">${value.examples}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="col-md-4 text-end">
                                    <div class="btn-group" role="group">
                                        <button id="list-property-required-${key}" class="btn btn-success btn-sm btn-radio rounded ${window._evObj.required.includes(key) ? '' : 'invisible'}"><i class="bi bi-exclamation-circle-fill"></i></button>        
                                        <button id="list-property-data-type-${key}" class="btn btn-primary btn-sm btn-radio rounded">${dataTypeShort(dataType)}</button>        
                                        <button class="btn btn-outline-primary btn-sm btn-radio rounded" onclick="editOne('toggle-${key}')">
                                            <i class="bi bi-pencil-fill"></i>   
                                        </button>        
                                    </div>
                                </div>
                            </div>
                            
                            <div class="row">
                                <div class="col-md-12 text-muted">
                                    ${value.description} 
                                </div>
                            </div>
                        </div>
                    </div>
                </div>       
            </div>    
            `,
            style: 'margin-bottom:10px; border: 0px',
            data: {
            type: 'property-box-wrapper'     
            }
        }
        cre(divId, 'div', options)
        removeProperty(key)
    })
}

function addProperty() {
    const randomId = 'add--' + Math.floor(Math.random()*10000).toString()
    const options = {
        id: 'property-' + randomId,
        innerHTML: `
        <div class="container" id="property-box-${randomId}" data-type="property-box">
            <div class="card p-2">
                <div class="row">   
                    <div class="col-md-6">
                        <div class="">
                            <label class="form-label px-2 small" for="name-${randomId}">property name</label>
                            <input class="form-control" type="text" id="name-${randomId}" placeholder= "property name" data-export="name" >
                        </div>    
                    </div>
                    <div class="col-md-6 text-end">
                        <div class="btn-group" role="group" aria-label="Radio Buttons" data-export="type">
                            <input type="radio" class="btn-check" name="options-${randomId}" id="option1-${randomId}" data-value="string" autocomplete="off">
                            <label class="btn btn-outline-primary btn-sm btn-radio rounded" for="option1-${randomId}">T</label>
                        
                            <input type="radio" class="btn-check" name="options-${randomId}" id="option2-${randomId}" data-value="number" autocomplete="off">
                            <label class="btn btn-outline-primary btn-sm btn-radio rounded" for="option2-${randomId}">#</label>
                        
                            <input type="radio" class="btn-check" name="options-${randomId}" id="option3-${randomId}" data-value="array" autocomplete="off">
                            <label class="btn btn-outline-primary btn-sm btn-radio rounded" for="option3-${randomId}">[]</label>
                        
                            <input type="radio" class="btn-check" name="options-${randomId}" id="option4-${randomId}" data-value="object" autocomplete="off">
                            <label class="btn btn-outline-primary btn-sm btn-radio rounded" for="option4-${randomId}">{}</label>

                            <input type="radio" class="btn-check" name="options-${randomId}" id="option5-${randomId}" data-value="boolean" autocomplete="off">
                            <label class="btn btn-outline-primary btn-sm btn-radio rounded" for="option5-${randomId}">t/f</label>
                        
                            <input type="radio" class="btn-check" name="options-${randomId}" id="option6-${randomId}" data-value="reference" autocomplete="off">
                            <label class="btn btn-outline-primary btn-sm btn-radio rounded" for="option6-${randomId}">ref</label>   
                        </div>    
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-12">
                        <label class="form-label px-2 small" for="examples-${randomId}">examples</label>
                        <input class="form-control" type="text" id="examples-${randomId}" name="${randomId}" placeholder="example-value" data-export="examples">
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-12">
                        <label class="form-label px-2 small" for="description-${randomId}">description</label>
                        <textarea class="form-control" id="description-${randomId}" data-export="description"></textarea>
                    </div>
                </div>    
                <div class="row pt-2">
                    <div class="col-md-6">
                        <input type="checkbox" id="checkbox-${randomId}" data-export="mandatory" checked>
                        <label for="checkbox-${randomId}">mandatory</label>   
                        
                    </div>
                    <div class="col-md-6 text-end">
                    <div class="btn-group">
                        <button class="btn btn-outline-success btn-sm rounded mx-2" id="add-property-${randomId}">add</button>
                        <button class="btn btn-outline-danger btn-sm rounded" id="remove-property-${randomId}">remove</button>
                    </div>    
                    </div>
                    
                </div>
            </div>
        </div>    
        `,
        style: 'margin-bottom:10px; border: 0px',
        data: {
           type: 'property-box-wrapper'     
        }
    }
    cre('event-breakdown', 'div', options)
    removeProperty(randomId)
}

function updateDataObject(obj, from) {
    if (from === 'list') {
        const allPropertiesBoxes = Array.from(document.getElementById('event-breakdown').querySelectorAll('[data-type="property-box"]'))
        let allProperties = {}
        allPropertiesBoxes.forEach((propertyBox) => {
            const name = propertyBox.querySelector('[data-export=name]').value
            const examples = [propertyBox.querySelector('[data-export=examples]').value]
            const type = Array.from(propertyBox.querySelector('[data-export=type]').querySelectorAll('input')).filter((input) => input.checked)[0].dataset.value
            const description = propertyBox.querySelector('[data-export=description]').value
            const mandatory = propertyBox.querySelector('[data-export=mandatory]').checked ? true : false
            allProperties[name] = {
                mandatory: mandatory,
                examples: examples,
                description: description,
                type: type
            }
            
        })        
    } else if (form === 'input') {

    } else {
        // error
    }
}
